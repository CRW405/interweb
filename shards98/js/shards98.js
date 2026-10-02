import { Window } from "./window.js";
import { Taskbar } from "./taskbar.js";
import { WindowGroup } from "./groups.js";
import { WindowManager } from "./manager.js";

export { Window, Taskbar, WindowGroup, WindowManager };

export function CreateWindow(htmlContent, options = {}) {
	if (typeof htmlContent !== "string") {
		throw new TypeError("CreateWindow requires an HTML string.");
	}
	const element = document.createElement("window");
	element.innerHTML = htmlContent;
	return new Window(element, options);
}

export function initialize(root = document, options = {}) {
	if (root.__shards98Manager) return root.__shards98Manager;
	const manager = new WindowManager(root, options);
	root.__shards98Manager = manager;
	return manager;
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => initialize());
} else {
	initialize();
}
