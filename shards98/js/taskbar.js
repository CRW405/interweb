export class Taskbar {
	constructor(element, windows) {
		this.element = element;
		this.windows = windows;
		this.tasks = element.querySelector(".tasks");
		this.startMenu = element.querySelector(".start-menu");
		this.startButton = element.querySelector(".icon");
		this.timeElement = element.querySelector(".time");
		this.calendarDate = new Date();
		this._bind();
		this.refresh();
	}

	_bind() {
		if (this.startMenu) this.startMenu.hidden = true;
		this.startButton?.addEventListener("click", () => {
			if (this.startMenu) this.startMenu.hidden = !this.startMenu.hidden;
		});
		document.addEventListener("shards98:windowchange", () => this.refresh());
		this.timeElement?.addEventListener("click", () => {
			this.use24Hour = !this.use24Hour;
			this._updateTime();
		});
		if (this.timeElement) {
			this._createCalendar();
			this._updateTime();
			this.timer = window.setInterval(() => this._updateTime(), 1000);
		}
	}

	_createCalendar() {
		this.calendar = document.createElement("section");
		this.calendar.className = "taskbar-calendar";
		this.calendar.setAttribute("aria-label", "Calendar");
		this.calendar.hidden = true;
		this.calendar.addEventListener("mouseenter", () => this._showCalendar());
		this.calendar.addEventListener("mouseleave", () => this._hideCalendar());
		this.timeElement.addEventListener("mouseenter", () => this._showCalendar());
		this.timeElement.addEventListener("mouseleave", () => this._hideCalendar());
		this.element.append(this.calendar);
		this._renderCalendar();
	}

	_showCalendar() {
		window.clearTimeout(this.calendarHideTimer);
		this.calendar.hidden = false;
	}

	_hideCalendar() {
		this.calendarHideTimer = window.setTimeout(() => {
			this.calendar.hidden = true;
		}, 150);
	}

	_renderCalendar() {
		const year = this.calendarDate.getFullYear();
		const month = this.calendarDate.getMonth();
		const monthName = this.calendarDate.toLocaleDateString([], {
			month: "long",
			year: "numeric",
		});
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const today = new Date();
		this.calendar.replaceChildren();

		const header = document.createElement("header");
		const previous = document.createElement("button");
		previous.type = "button";
		previous.setAttribute("aria-label", "Previous month");
		previous.textContent = "<";
		previous.addEventListener("click", () => {
			this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
			this._renderCalendar();
		});
		const title = document.createElement("strong");
		title.textContent = monthName;
		const next = document.createElement("button");
		next.type = "button";
		next.setAttribute("aria-label", "Next month");
		next.textContent = ">";
		next.addEventListener("click", () => {
			this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
			this._renderCalendar();
		});
		header.append(previous, title, next);

		const grid = document.createElement("div");
		grid.className = "calendar-grid";
		["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((day) => {
			const label = document.createElement("span");
			label.textContent = day;
			label.className = "calendar-weekday";
			grid.append(label);
		});
		for (let index = 0; index < firstDay; index += 1) grid.append(document.createElement("span"));
		for (let day = 1; day <= daysInMonth; day += 1) {
			const cell = document.createElement("span");
			cell.textContent = day;
			if (
				year === today.getFullYear() &&
				month === today.getMonth() &&
				day === today.getDate()
			) {
				cell.className = "calendar-today";
			}
			grid.append(cell);
		}
		this.calendar.append(header, grid);
	}

	_updateTime() {
		const now = new Date();
		this.timeElement.textContent = now.toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit",
			hour12: !this.use24Hour,
		});
	}

	refresh() {
		if (!this.tasks) return;
		this.tasks.replaceChildren();
		this.startMenu?.querySelector(".start-list")?.replaceChildren();
		this.windows.forEach((instance) => {
			if (instance.state.status === "closed") this._addStartItem(instance);
			else this._addTaskItem(instance);
		});
	}

	_addTaskItem(instance) {
		const item = document.createElement("li");
		const status = instance.state.status;
		item.dataset.status = status;
		item.classList.add(`status-${status}`);
		item.addEventListener("auxclick", (event) => {
			if (event.button !== 1) return;
			event.preventDefault();
			instance.close();
		});
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.status = status;
		button.classList.add(`status-${status}`);
		button.textContent = instance.element.getAttribute("name") || "Window";
		button.addEventListener("click", () => {
			if (instance.state.status === "minimized") instance.open();
			else instance.minimize();
		});
		item.append(button);
		if (instance.state.status === "minimized") item.classList.add("minimized");
		const close = document.createElement("button");
		close.type = "button";
		close.className = "close-btn";
		close.setAttribute("aria-label", "Close");
		close.textContent = "X";
		close.addEventListener("click", (event) => {
			event.stopPropagation();
			instance.close();
		});
		item.append(close);
		this.tasks.append(item);
	}

	_addStartItem(instance) {
		const list = this.startMenu?.querySelector(".start-list");
		if (!list) return;
		const item = document.createElement("li");
		item.dataset.status = instance.state.status;
		item.classList.add(`status-${instance.state.status}`);
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.status = instance.state.status;
		button.classList.add(`status-${instance.state.status}`);
		button.textContent = instance.element.getAttribute("name") || "Window";
		button.addEventListener("click", () => {
			instance.open();
			this.startMenu.hidden = true;
		});
		item.append(button);
		list.append(item);
	}
}
