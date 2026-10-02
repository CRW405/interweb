import { SELECTORS } from "./config.js";
import { Window } from "./window.js";
import { Taskbar } from "./taskbar.js";
import { WindowGroup } from "./groups.js";

export class WindowManager {
	constructor(root = document, options = {}) {
		this.root = root;
		this.options = options;
		this.windows = [];
		this.groups = [];
		this.taskbar = null;
		this.initialize();
	}

	initialize() {
		this.root.querySelectorAll(SELECTORS.group).forEach((element) => {
			const group = new WindowGroup(element, this.options);
			this.groups.push(group);
			this.windows.push(...group.windows);
		});
		this.root.querySelectorAll(SELECTORS.window).forEach((element) => {
			if (!element.closest(SELECTORS.group)) {
				this.windows.push(new Window(element, this.options));
			}
		});
		const taskbarElement = this.root.querySelector(SELECTORS.taskbar);
		if (taskbarElement) this.taskbar = new Taskbar(taskbarElement, this.windows);
		return this;
	}

	enhance(element, options = this.options) {
		const instance = new Window(element, options);
		if (!this.windows.includes(instance)) this.windows.push(instance);
		this.taskbar?.refresh();
		return instance;
	}
}
