import { DEFAULTS, ICONS, SELECTORS, clamp } from "./config.js";

export class Window {
	static nextZIndex = 10;

	constructor(element, options = {}) {
		if (
			!(element instanceof HTMLElement) ||
			element.tagName.toLowerCase() !== "window"
		) {
			throw new TypeError("Window requires a <window> element.");
		}
		if (element.__shards98Window) return element.__shards98Window;

		this.element = element;
		this.options = { ...DEFAULTS, ...options };
		this.state = {
			status: element.getAttribute("status") || "opened",
			maximized: element.classList.contains("maximized"),
		};
		this.previousRect = null;
		this.groupState = null;
		this._setup();
		element.__shards98Window = this;
	}

	_setup() {
		this._removeGeneratedParts();
		this._ensureContentContainer();
		this.element.setAttribute("status", this.state.status);
		this.element.classList.toggle("maximized", this.state.maximized);
		this._createTitle();
		if (this.options.controls) this._createControls();
		if (this.options.draggable) this._enableDragging();
		if (this.options.resizable) this._enableResizing();
		this._updateResizeHandles();
		this._applyStatus();
		this.element.addEventListener("pointerdown", () => this.focus());
		this.element.addEventListener("click", () => this.focus());
	}

	get content() {
		return this.contentElement;
	}

	_removeGeneratedParts() {
		this.element
			.querySelectorAll(
				":scope > window-title, :scope > window-controls, :scope > .resize-handle",
			)
			.forEach((part) => part.remove());
	}

	_createTitle() {
		if (!this.options.title) return;
		const title = document.createElement("window-title");
		title.textContent = this.element.getAttribute("name") || "";
		title.setAttribute("aria-label", title.textContent);
		this.element.prepend(title);
		this.titleElement = title;
	}

	_ensureContentContainer() {
		const existing = this.element.querySelector(":scope > .window-content");
		if (existing) {
			this.contentElement = existing;
			return;
		}
		const content = document.createElement("div");
		content.className = "window-content";
		while (this.element.firstChild) content.append(this.element.firstChild);
		this.element.append(content);
		this.contentElement = content;
	}

	_createControls() {
		const controls = document.createElement("window-controls");
		const addButton = (name, label, icon, handler) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = name;
			button.setAttribute("aria-label", label);
			button.innerHTML = icon;
			button.addEventListener("click", (event) => {
				event.stopPropagation();
				handler();
			});
			controls.append(button);
		};

		if (this.options.minimize)
			addButton("minimize", "Minimize", "_", () => this.minimize());
		if (this.options.maximize)
			addButton("maximize", "Maximize", ICONS.maximize, () =>
				this.toggleMaximize(),
			);
		addButton("dock", "Return to window group", ICONS.dock, () => this.dock());
		if (this.options.close) addButton("close", "Close", "X", () => this.close());
		this.element.prepend(controls);
		this.controlsElement = controls;
		this._updateDockControl();
		this._updateControlState();
	}

	_updateDockControl() {
		const button = this.controlsElement?.querySelector(".dock");
		if (button) button.hidden = !this.groupState;
	}

	_updateControlState() {
		const button = this.controlsElement?.querySelector(".maximize");
		if (!button) return;
		button.innerHTML = this.state.maximized ? ICONS.restore : ICONS.maximize;
		button.setAttribute(
			"aria-label",
			this.state.maximized ? "Restore" : "Maximize",
		);
	}

	_enableDragging() {
		this.titleElement?.addEventListener("pointerdown", (event) => {
			if (event.button !== 0 || this.state.maximized) return;
			event.preventDefault();
			event.stopPropagation();
			this.focus();
			const rect = this.element.getBoundingClientRect();
			if (!this.groupState && this.element.closest(SELECTORS.group)) {
				this._detachFromGroup(rect);
			}
			this.element.style.width = `${rect.width}px`;
			this.element.style.height = `${rect.height}px`;
			this.element.style.position = "absolute";
			const offsetParent = this.element.offsetParent || document.body;
			const parentRect = offsetParent?.getBoundingClientRect() || {
				left: 0,
				top: 0,
			};
			const parentPageLeft = parentRect.left + window.scrollX;
			const parentPageTop = parentRect.top + window.scrollY;
			const startLeft = rect.left + window.scrollX - parentPageLeft;
			const startTop = rect.top + window.scrollY - parentPageTop;
			this.element.style.left = `${startLeft}px`;
			this.element.style.top = `${startTop}px`;
			this.element.setPointerCapture(event.pointerId);
			this.element.classList.add("is-dragging");
			const move = (moveEvent) => {
				const deltaX = moveEvent.clientX - event.clientX;
				const deltaY = moveEvent.clientY - event.clientY;
				this.element.style.left = `${startLeft + deltaX}px`;
				this.element.style.top = `${startTop + deltaY}px`;
			};
			const stop = () => {
				this.element.removeEventListener("pointermove", move);
				this.element.removeEventListener("pointerup", stop);
				this.element.removeEventListener("pointercancel", stop);
				this.element.classList.remove("is-dragging");
			};
			this.element.addEventListener("pointermove", move);
			this.element.addEventListener("pointerup", stop);
			this.element.addEventListener("pointercancel", stop);
		});
	}

	_enableResizing() {
		["n", "e", "s", "w", "ne", "se", "sw", "nw"].forEach((edge) => {
			const handle = document.createElement("span");
			handle.className = `resize-handle resize-${edge}`;
			handle.setAttribute("aria-hidden", "true");
			handle.addEventListener("pointerdown", (event) =>
				this._startResize(event, edge),
			);
			this.element.append(handle);
		});
	}

	_updateResizeHandles() {
		const docked = Boolean(this.element.closest(SELECTORS.group) && !this.groupState);
		this.element
			.querySelectorAll(":scope > .resize-handle")
			.forEach((handle) => {
				handle.hidden = docked;
			});
	}

	_startResize(event, edge) {
		if (
			event.button !== 0 ||
			this.state.maximized ||
			(this.element.closest(SELECTORS.group) && !this.groupState)
		)
			return;
		event.preventDefault();
		event.stopPropagation();
		const rect = this.element.getBoundingClientRect();
		const startX = event.clientX;
		const startY = event.clientY;
		const minWidth = parseFloat(getComputedStyle(this.element).minWidth) || 160;
		const minHeight = parseFloat(getComputedStyle(this.element).minHeight) || 80;
		this.element.setPointerCapture(event.pointerId);
		const move = (moveEvent) => {
			const dx = moveEvent.clientX - startX;
			const dy = moveEvent.clientY - startY;
			let left = rect.left;
			let top = rect.top;
			let width = rect.width;
			let height = rect.height;
			if (edge.includes("e")) width = Math.max(minWidth, rect.width + dx);
			if (edge.includes("s")) height = Math.max(minHeight, rect.height + dy);
			if (edge.includes("w")) {
				width = Math.max(minWidth, rect.width - dx);
				left = rect.right - width;
			}
			if (edge.includes("n")) {
				height = Math.max(minHeight, rect.height - dy);
				top = rect.bottom - height;
			}
			this.element.style.position = "fixed";
			this.element.style.left = `${clamp(left, 0, window.innerWidth - minWidth)}px`;
			this.element.style.top = `${clamp(top, 0, window.innerHeight - minHeight - this._taskbarHeight())}px`;
			this.element.style.width = `${Math.min(width, window.innerWidth)}px`;
			this.element.style.height = `${Math.min(height, window.innerHeight)}px`;
		};
		const stop = () => {
			this.element.removeEventListener("pointermove", move);
			this.element.removeEventListener("pointerup", stop);
			this.element.removeEventListener("pointercancel", stop);
		};
		this.element.addEventListener("pointermove", move);
		this.element.addEventListener("pointerup", stop);
		this.element.addEventListener("pointercancel", stop);
	}

	_taskbarHeight() {
		return document.querySelector(SELECTORS.taskbar)?.getBoundingClientRect().height || 0;
	}

	_applyStatus() {
		const hidden = this.state.status === "minimized" || this.state.status === "closed";
		this.element.setAttribute("status", this.state.status);
		this.element.hidden = hidden;
		this.element.classList.toggle("maximized", this.state.maximized && !hidden);
		this._updateControlState();
	}

	_detachFromGroup(rect) {
		const group = this.element.parentElement;
		const isFloating = this.element.hasAttribute("floating");
		const placeholder = isFloating ? null : document.createElement("span");
		if (placeholder) {
			placeholder.className = "window-placeholder";
			placeholder.style.width = `${rect.width}px`;
			placeholder.style.height = `${rect.height}px`;
			placeholder.setAttribute("aria-hidden", "true");
		}
		this.groupState = {
			parent: group,
			placeholder,
			nextSibling: this.element.nextElementSibling,
			cssText: this.element.style.cssText,
			inlineStyles: {
				position: this.element.style.position,
				left: this.element.style.left,
				top: this.element.style.top,
				right: this.element.style.right,
				bottom: this.element.style.bottom,
				width: this.element.style.width,
				height: this.element.style.height,
			},
		};
		if (placeholder) group.insertBefore(placeholder, this.element);
		this.element.style.width = `${rect.width}px`;
		this.element.style.height = `${rect.height}px`;
		document.body.append(this.element);
		this.element.style.position = "absolute";
		this.element.style.left = `${rect.left + window.scrollX}px`;
		this.element.style.top = `${rect.top + window.scrollY}px`;
		this._updateDockControl();
		this._updateResizeHandles();
	}

	setOption(name, value) {
		if (!(name in DEFAULTS)) throw new Error(`Unknown window option: ${name}`);
		this.options[name] = Boolean(value);
		this._setup();
		return this;
	}

	setTitle(title) {
		this.element.setAttribute("name", title);
		if (this.titleElement) this.titleElement.textContent = title;
		return this;
	}

	open() {
		this.state.status = "opened";
		this._applyStatus();
		this._notifyTaskbar();
		return this;
	}

	minimize() {
		this.state.status = "minimized";
		this.state.maximized = false;
		this._applyStatus();
		this._notifyTaskbar();
		return this;
	}

	close() {
		this.state.status = "closed";
		this.state.maximized = false;
		this._applyStatus();
		this._notifyTaskbar();
		return this;
	}

	focus() {
		this.element.style.zIndex = ++Window.nextZIndex;
		return this;
	}

	dock() {
		if (!this.groupState) return this;
		const { parent, placeholder, cssText, inlineStyles } = this.groupState;
		this.state.maximized = false;
		this.element.classList.remove("maximized");
		if (placeholder) {
			parent.insertBefore(this.element, placeholder);
			placeholder.remove();
		} else {
			const { nextSibling } = this.groupState;
			parent.insertBefore(this.element, nextSibling);
		}
		this.element.style.cssText = cssText;
		Object.assign(this.element.style, inlineStyles);
		this.groupState = null;
		this.state.status = "opened";
		this._updateDockControl();
		this._updateResizeHandles();
		this._applyStatus();
		this.focus();
		this._notifyTaskbar();
		return this;
	}

	toggleMaximize() {
		if (this.state.maximized) return this.restore();
		this.previousRect = { cssText: this.element.style.cssText };
		this.state.status = "opened";
		this.state.maximized = true;
		this._applyStatus();
		this._notifyTaskbar();
		return this;
	}

	restore() {
		this.state.status = "opened";
		this.state.maximized = false;
		if (this.previousRect) this.element.style.cssText = this.previousRect.cssText;
		this._applyStatus();
		this._notifyTaskbar();
		return this;
	}

	_notifyTaskbar() {
		this.element.dispatchEvent(
			new CustomEvent("shards98:windowchange", { bubbles: true }),
		);
	}
}
