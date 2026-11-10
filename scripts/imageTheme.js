import { applyTheme, createTheme, extractPalette } from "./colors.js";

const themeProperties = [
	"--window-background",
	"--window-border-light",
	"--window-border-dark",
	"--interactive-background-light",
	"--interactive-background-dark",
	"--interactive-border-light",
	"--interactive-border-dark",
	"--interactive-select",
	"--text",
	"--text-grey",
	"--text-light",
	"--link",
	"--link-hover",
	"--danger",
];

const defaultTheme = Object.fromEntries(
	themeProperties.map((property) => [
		property,
		getComputedStyle(document.documentElement).getPropertyValue(property),
	]),
);

function unwrapProxy(url) {
	try {
		const parsed = new URL(url, document.baseURI);
		if (parsed.hostname.endsWith("duckduckgo.com")) {
			const original = parsed.searchParams.get("u");
			if (original) return original;
		}
	} catch {
		// Not a parseable URL; use it as-is.
	}
	return url;
}

const imageSource = (image) => {
	if (!image) return "";
	const raw =
		typeof image === "string" ? image : image.currentSrc || image.src || "";
	return unwrapProxy(raw);
};

// Many image CDNs (Bandcamp, DuckDuckGo, ...) serve images without the CORS
// headers canvas needs. Re-fetch those through an image proxy that does.
const IMAGE_PROXY = "https://images.weserv.nl/?url=";

function proxySource(source) {
	try {
		const url = new URL(source, document.baseURI);
		if (url.protocol !== "http:" && url.protocol !== "https:") return "";
		if (url.origin === window.location.origin) return "";
		if (url.hostname === "images.weserv.nl" || url.hostname === "wsrv.nl") {
			return "";
		}
		return `${IMAGE_PROXY}${encodeURIComponent(
			url.href.replace(/^https?:\/\//, ""),
		)}`;
	} catch {
		return "";
	}
}

async function extractPaletteWithFallback(source, options) {
	try {
		return await extractPalette(source, options);
	} catch (error) {
		const proxied = proxySource(source);
		if (!proxied) throw error;
		return extractPalette(proxied, options);
	}
}

export async function themeElementFromImage(target, image, options = {}) {
	const source = imageSource(image);
	if (!target || !source) return null;

	const { mode, ...paletteOptions } = options;

	try {
		const palette = await extractPaletteWithFallback(source, paletteOptions);
		const theme = createTheme(palette, mode ? { mode } : {});
		applyTheme(theme, target);
		return { palette, theme };
	} catch (error) {
		console.debug(
			`imageTheme: skipped ${target.id || target.className || target.tagName}`,
			error,
		);
		return null;
	}
}

export function resetTheme(target = document.documentElement) {
	return applyTheme(defaultTheme, target);
}

// put images and elements here
function themeStaticContent() {
	const katz = document.querySelector("#katz-img-window");
	if (katz) themeElementFromImage(katz, katz.querySelector("img"));

	for (const card of document.querySelectorAll(".music-card")) {
		themeElementFromImage(card, card.querySelector("img"));
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", themeStaticContent, {
		once: true,
	});
} else {
	themeStaticContent();
}
