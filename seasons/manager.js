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
	defaultTheme: new Map(),
	themeClass: "",
	request: 0,
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

function rememberDefaultTheme(theme) {
	Object.keys(theme || {}).forEach((property) => {
		if (state.defaultTheme.has(property)) return;
		state.defaultTheme.set(
			property,
			document.documentElement.style.getPropertyValue(property),
		);
	});
}

function applyTheme(theme) {
	rememberDefaultTheme(theme);
	Object.entries(theme || {}).forEach(([property, value]) => {
		document.documentElement.style.setProperty(property, value);
	});
}

function clearTheme() {
	state.defaultTheme.forEach((value, property) => {
		if (value) document.documentElement.style.setProperty(property, value);
		else document.documentElement.style.removeProperty(property);
	});
	if (state.themeClass) {
		document.documentElement.classList.remove(state.themeClass);
	}
	document.documentElement.classList.remove("halloween-palette");
	state.themeClass = "";
}

function updateToggle() {
	if (!state.toggle) {
		state.toggle = document.createElement("button");
		state.toggle.className = "halloween-season-ui";
		state.toggle.type = "button";
		state.toggle.dataset.seasonToggle = "";
		document.body.append(state.toggle);
	}
	if (!state.season) {
		state.toggle.hidden = true;
		return;
	}
	state.toggle.hidden = false;
	state.toggle.textContent = state.active
		? "Return to normal"
		: `Enable ${state.season.name}`;
	state.toggle.classList.toggle("normal-preview", state.active);
	state.toggle.classList.toggle("halloween-preview", !state.active);
	state.toggle.onclick = () => {
		if (state.active) deactivateSeason();
		else activateSeason(state.season);
	};
}

function announceState() {
	document.dispatchEvent(
		new CustomEvent("seasons:statechange", {
			detail: { name: state.season?.name ?? "", active: state.active },
		}),
	);
}

// Let other theme owners (the wallpaper window) restore their defaults before
// a season applies its own theme.
function announceBeforeChange() {
	document.dispatchEvent(new CustomEvent("seasons:beforechange"));
}

async function activateSeason(season, { force = false } = {}) {
	if (!season) return;
	const request = ++state.request;
	const sameSeason = state.active && state.season === season;
	if (sameSeason && !force) return;

	let implementation =
		state.season === season ? state.implementation : null;

	if (!implementation) {
		addStylesheet(season.stylesheet);
		try {
			const module = await import(season.module);
			if (request !== state.request) return;
			implementation = module.season;
			if (!implementation) {
				throw new Error("season module did not export a season");
			}
			implementation.theme = module.theme ?? implementation.theme ?? {};
		} catch (error) {
			console.error(`Could not load the ${season.name} season:`, error);
			return;
		}
	}

	if (request !== state.request) return;

	// Re-applying the same season keeps its effects running instead of
	// restarting them.
	if (state.active && state.implementation && !sameSeason) {
		state.implementation.stop();
	}
	clearTheme();
	announceBeforeChange();
	state.season = season;
	state.implementation = implementation;
	state.themeClass = season.themeClass;
	applyTheme(implementation.theme);
	document.documentElement.classList.add(season.themeClass);
	implementation.start();
	state.active = true;
	updateToggle();
	announceState();
}

function deactivateSeason() {
	state.request += 1;
	if (state.active) state.implementation?.stop();
	state.active = false;
	clearTheme();
	announceBeforeChange();
	updateToggle();
	announceState();
}

function seasonForDate(date) {
	const month = date.getMonth();
	if (month === 9 || (month === 10 && date.getDate() <= 15)) {
		return SEASONS[9];
	}
	return SEASONS[month] ?? null;
}

function startSeason() {
	const season = seasonForDate(new Date());
	if (season) activateSeason(season);
}

document.addEventListener("shards98:calendarmonthchange", (event) => {
	const season = SEASONS[event.detail?.month];
	if (season) activateSeason(season, { force: true });
	else deactivateSeason();
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startSeason, { once: true });
} else {
	startSeason();
}
