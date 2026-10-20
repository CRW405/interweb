const SEASONS = {
	9: {
		name: "Halloween",
		themeClass: "halloween-theme",
		module: "./halloween/halloween.js",
		stylesheet: "./halloween/halloween.css",
	},
	11: {
		name: "Christmas",
		themeClass: "christmas-theme",
		module: "./christmas/christmas.js",
		stylesheet: "./christmas/christmas.css",
	},
};

const state = {
	season: null,
	implementation: null,
	active: false,
	toggle: null,
	theme: new Map(),
	defaultTheme: new Map(),
	themeClass: "",
};

function addStylesheet(path) {
	const href = new URL(path, import.meta.url).href;
	if (document.querySelector(`link[data-season-stylesheet="${href}"]`)) return;
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = href;
	link.dataset.seasonStylesheet = href;
	document.head.append(link);
}

function applyTheme(theme) {
	state.theme.clear();
	Object.entries(theme || {}).forEach(([property, value]) => {
		state.theme.set(property, document.documentElement.style.getPropertyValue(property));
		document.documentElement.style.setProperty(property, value);
	});
	document.documentElement.classList.add(state.themeClass);
}

function clearTheme() {
	state.defaultTheme.forEach((value, property) => {
		if (value) document.documentElement.style.setProperty(property, value);
		else document.documentElement.style.removeProperty(property);
	});
	state.theme.clear();
	document.documentElement.classList.remove(state.themeClass);
	document.documentElement.classList.remove("halloween-palette");
}

function updateToggle() {
	if (!state.toggle) {
		state.toggle = document.createElement("button");
		state.toggle.className = "halloween-season-ui";
		state.toggle.type = "button";
		state.toggle.dataset.seasonToggle = "";
		document.body.append(state.toggle);
	}
	state.toggle.textContent = state.active
		? "Return to normal"
		: `Enable ${state.season.name}`;
	state.toggle.classList.toggle("normal-preview", state.active);
	state.toggle.classList.toggle("halloween-preview", !state.active);
	state.toggle.onclick = () => {
		if (state.active) {
			state.implementation.stop();
			clearTheme();
			state.active = false;
		} else {
			applyTheme(state.implementation.theme);
			state.implementation.start();
			state.active = true;
		}
		updateToggle();
		announceState();
	};
}

function announceState() {
	document.dispatchEvent(
		new CustomEvent("seasons:statechange", {
			detail: { name: state.season.name, active: state.active },
		}),
	);
}

async function startSeason() {
	const season = SEASONS[new Date().getMonth()];
	if (!season) return;
	state.season = season;
	state.themeClass = season.themeClass;
	addStylesheet(season.stylesheet);
	const module = await import(season.module);
	state.implementation = module.season;
	state.implementation.theme = module.theme;
	Object.keys(state.implementation.theme).forEach((property) => {
		state.defaultTheme.set(
			property,
			getComputedStyle(document.documentElement).getPropertyValue(property),
		);
	});
	applyTheme(state.implementation.theme);
	state.implementation.start();
	state.active = true;
	updateToggle();
	announceState();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startSeason, { once: true });
} else {
	startSeason();
}
