import { Window } from "./window.js";

export class WindowGroup {
	constructor(element, options = {}) {
		this.element = element;
		this.options = options;
		this.windows = [...element.querySelectorAll(":scope > window")].map(
			(windowElement) => new Window(windowElement, options),
		);
	}
}
