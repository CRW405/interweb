import { resetTheme, themeElementFromImage } from "./imageTheme.js";
import { applyTheme } from "./colors.js";
import { theme as halloweenTheme } from "../seasons/halloween/theme.js";

const wallpaperWindow = document.querySelector("#wallpaper-window");
const wallpaperSelect = wallpaperWindow?.querySelector("#wallpaper-select");
const wallpaperFile = wallpaperWindow?.querySelector("#wallpaper-file");
const themeMode = wallpaperWindow?.querySelectorAll(
	'input[name="wallpaper-theme"]',
);
const status = wallpaperWindow?.querySelector("#wallpaper-status");

const wallpapers = [
	["Ascent", "./medias/bg/Ascent.jpg"],
	["Animated Grid", "./medias/bg/animgridbg.gif"],
	["Animated Grid (50%)", "./medias/bg/animgridbg50.gif"],
	["Bliss", "./medias/bg/bliss.jpg"],
	["Grid", "./medias/bg/gridbg.jpg"],
	["Halloween", "./medias/bg/halloween.jpg"],
];

let customWallpaperUrl = null;
let themeRequest = 0;
let seasonalEffectsActive = false;

function setStatus(message, isError = false) {
	if (!status) return;
	status.textContent = message;
	status.classList.toggle("danger", isError);
}

function setWallpaper(source) {
	const wallpaperUrl = new URL(source, document.baseURI).href;
	const tiles = /(?:gridbg|animgridbg|tile|tiling)/i.test(source);
	const root = document.documentElement;

	root.style.setProperty("--wallpaper-image", `url("${wallpaperUrl}")`);
	root.style.setProperty("--wallpaper-repeat", tiles ? "repeat" : "no-repeat");
	root.style.setProperty("--wallpaper-size", tiles ? "auto" : "cover");
	root.style.setProperty("--wallpaper-position", tiles ? "top left" : "center");
}

async function applySelectedTheme() {
	const source = wallpaperSelect?.selectedOptions[0]?.dataset.source;
	if (!source) return;
	const request = ++themeRequest;
	const selectedTheme = wallpaperWindow.querySelector(
		'input[name="wallpaper-theme"]:checked',
	)?.value;
	document.documentElement.classList.toggle(
		"halloween-palette",
		selectedTheme === "halloween",
	);

	if (selectedTheme === "halloween") {
		applyTheme(halloweenTheme);
		setStatus("Using the Halloween color theme.");
		return;
	}

	if (selectedTheme === "default") {
		resetTheme();
		setStatus("Using the default theme.");
		return;
	}

	setStatus("Generating a theme...");
	const result = await themeElementFromImage(document.documentElement, source);
	if (request !== themeRequest) return;
	if (result) setStatus("Using a theme generated from this wallpaper.");
	else setStatus("Could not generate a theme from this wallpaper.", true);
}

function selectWallpaper(source) {
	const option = [...wallpaperSelect.options].find(
		(item) => item.dataset.source === source,
	);
	if (!option) return;
	wallpaperSelect.value = option.value;
	setWallpaper(source);
	applySelectedTheme();
}

if (wallpaperWindow && wallpaperSelect && wallpaperFile) {
	for (const [name, source] of wallpapers) {
		const option = new Option(name, source);
		option.dataset.source = source;
		wallpaperSelect.append(option);
	}

	wallpaperSelect.addEventListener("change", () => {
		const source = wallpaperSelect.selectedOptions[0].dataset.source;
		setWallpaper(source);
		applySelectedTheme();
	});

	wallpaperFile.addEventListener("change", () => {
		const [file] = wallpaperFile.files;
		if (!file) return;
		if (customWallpaperUrl) URL.revokeObjectURL(customWallpaperUrl);
		customWallpaperUrl = URL.createObjectURL(file);
		const option = new Option(`Your wallpaper: ${file.name}`, "custom");
		option.dataset.source = customWallpaperUrl;
		wallpaperSelect.querySelector('[value="custom"]')?.remove();
		wallpaperSelect.append(option);
		wallpaperSelect.value = "custom";
		setWallpaper(customWallpaperUrl);
		applySelectedTheme();
	});

	themeMode.forEach((input) =>
		input.addEventListener("change", applySelectedTheme),
	);

	document.addEventListener("seasons:statechange", (event) => {
		seasonalEffectsActive = event.detail.active;
		const halloweenOption = wallpaperWindow.querySelector(
			'input[name="wallpaper-theme"][value="halloween"]',
		);
		const selectedTheme = wallpaperWindow.querySelector(
			'input[name="wallpaper-theme"]:checked',
		)?.value;
		if (!seasonalEffectsActive) {
			const defaultOption = wallpaperWindow.querySelector(
				'input[name="wallpaper-theme"][value="default"]',
			);
			if (defaultOption) defaultOption.checked = true;
			document.documentElement.classList.remove("halloween-palette");
			setStatus("Using the default theme.");
			return;
		}
		if (halloweenOption && selectedTheme === "default") {
			halloweenOption.checked = true;
		}
	});

	selectWallpaper(wallpapers[0][1]);
}
