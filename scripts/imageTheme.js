import { applyTheme, createTheme, extractPalette } from "./colors.js";

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

export async function themeElementFromImage(target, image, options) {
	const source = imageSource(image);
	if (!target || !source) return null;

	try {
		const palette = await extractPalette(source, options);
		const theme = createTheme(palette);
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
