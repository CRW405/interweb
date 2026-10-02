export const SELECTORS = {
	window: "window",
	group: "window-group",
	taskbar: "taskbar",
};

export const ICONS = {
	maximize:
		'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h10v10H3zm1 1v8h8V4z"/></svg>',
	restore:
		'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 5h8v8H5zM3 3h8v1H4v7H3zm3 3h6v6H6z" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>',
	dock:
		'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h10v7H9v3H7v-3H3z" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>',
};

export const DEFAULTS = {
	draggable: true,
	resizable: true,
	controls: true,
	title: true,
	minimize: true,
	maximize: true,
	close: true,
};

export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
