const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };
const LAB_EPSILON = 216 / 24389; // (6 / 29) ** 3
const LAB_KAPPA = 24389 / 27;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(value)));

function srgbToLinear(channel) {
	const c = channel / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel) {
	const c =
		channel <= 0.0031308
			? channel * 12.92
			: 1.055 * channel ** (1 / 2.4) - 0.055;
	return clamp255(c * 255);
}

function labPivot(value) {
	return value > LAB_EPSILON ? Math.cbrt(value) : (841 / 108) * value + 4 / 29;
}

function labPivotInverse(value) {
	const cube = value ** 3;
	return cube > LAB_EPSILON ? cube : (116 * value - 16) / LAB_KAPPA;
}

export function rgbToHex({ r, g, b }) {
	return `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(hex) {
	const value = hex.replace("#", "");
	const full =
		value.length === 3
			? value
					.split("")
					.map((c) => c + c)
					.join("")
			: value;
	const numeric = Number.parseInt(full, 16);
	return {
		r: (numeric >> 16) & 255,
		g: (numeric >> 8) & 255,
		b: numeric & 255,
	};
}

export function rgbToLab(rgb) {
	const r = srgbToLinear(rgb.r);
	const g = srgbToLinear(rgb.g);
	const b = srgbToLinear(rgb.b);

	const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / D65.x;
	const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / D65.y;
	const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / D65.z;

	const fx = labPivot(x);
	const fy = labPivot(y);
	const fz = labPivot(z);

	return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function labToRgb(lab) {
	const fy = (lab.L + 16) / 116;
	const fx = fy + lab.a / 500;
	const fz = fy - lab.b / 200;

	const x = D65.x * labPivotInverse(fx);
	const y = D65.y * labPivotInverse(fy);
	const z = D65.z * labPivotInverse(fz);

	const r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
	const g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
	const b = 0.0557 * x - 0.204 * y + 1.057 * z;

	return {
		r: linearToSrgb(clamp01(r)),
		g: linearToSrgb(clamp01(g)),
		b: linearToSrgb(clamp01(b)),
	};
}

const chroma = (lab) => Math.hypot(lab.a, lab.b);

function labDistance(a, b, lightnessWeight = 1) {
	const dl = (a.L - b.L) * lightnessWeight;
	const da = a.a - b.a;
	const db = a.b - b.b;
	return Math.sqrt(dl * dl + da * da + db * db);
}

function relativeLuminance({ r, g, b }) {
	return (
		0.2126 * srgbToLinear(r) +
		0.7152 * srgbToLinear(g) +
		0.0722 * srgbToLinear(b)
	);
}

function mix(a, b, t) {
	return {
		r: clamp255(a.r + (b.r - a.r) * t),
		g: clamp255(a.g + (b.g - a.g) * t),
		b: clamp255(a.b + (b.b - a.b) * t),
	};
}

const lighten = (rgb, t) => mix(rgb, { r: 255, g: 255, b: 255 }, t);
const darken = (rgb, t) => mix(rgb, { r: 0, g: 0, b: 0 }, t);

function grayscale({ r, g, b }) {
	const luma = clamp255(0.299 * r + 0.587 * g + 0.114 * b);
	return { r: luma, g: luma, b: luma };
}

const desaturate = (rgb, t = 0.5) => mix(rgb, grayscale(rgb), t);

function toRgb(color) {
	return typeof color === "string"
		? hexToRgb(color)
		: { r: color.r, g: color.g, b: color.b };
}

export function contrastRatio(a, b) {
	const la = relativeLuminance(toRgb(a));
	const lb = relativeLuminance(toRgb(b));
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Mix `color` toward `extreme` by the smallest amount that reaches `minRatio`.
function mixUntilContrast(color, background, extreme, minRatio) {
	let low = 0;
	let high = 1;
	let best = extreme;

	for (let i = 0; i < 12; i++) {
		const t = (low + high) / 2;
		const candidate = mix(color, extreme, t);
		if (contrastRatio(candidate, background) >= minRatio) {
			best = candidate;
			high = t;
		} else {
			low = t;
		}
	}

	return best;
}

export function readableText(background, preferred, { minRatio = 4.5 } = {}) {
	const backgroundRgb = toRgb(background);
	const black = { r: 0, g: 0, b: 0 };
	const white = { r: 255, g: 255, b: 255 };

	const base = preferred
		? toRgb(preferred)
		: relativeLuminance(backgroundRgb) > 0.5
			? black
			: white;

	if (contrastRatio(base, backgroundRgb) >= minRatio) return rgbToHex(base);

	const extreme = relativeLuminance(backgroundRgb) > 0.5 ? black : white;
	const mixed = mixUntilContrast(base, backgroundRgb, extreme, minRatio);

	if (contrastRatio(mixed, backgroundRgb) >= minRatio) return rgbToHex(mixed);

	return rgbToHex(
		contrastRatio(black, backgroundRgb) >= contrastRatio(white, backgroundRgb)
			? black
			: white,
	);
}

export function readableGray(background) {
	const backgroundRgb = toRgb(background);
	const black = { r: 0, g: 0, b: 0 };
	const white = { r: 255, g: 255, b: 255 };

	return rgbToHex(
		contrastRatio(black, backgroundRgb) >= contrastRatio(white, backgroundRgb)
			? black
			: white,
	);
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.onload = () => resolve(image);
		image.onerror = () =>
			reject(new Error(`colors.js: failed to load image "${src}"`));
		image.src = src;
	});
}

function ensureImageLoaded(image) {
	if (image.complete && image.naturalWidth > 0) return Promise.resolve();
	return new Promise((resolve, reject) => {
		image.addEventListener("load", () => resolve(), { once: true });
		image.addEventListener(
			"error",
			() => reject(new Error("colors.js: failed to load image")),
			{
				once: true,
			},
		);
	});
}

function drawScaled(ctx, canvas, source, maxSize) {
	const width = source.naturalWidth || source.width;
	const height = source.naturalHeight || source.height;
	const scale = Math.min(1, maxSize / Math.max(width, height));

	canvas.width = Math.max(1, Math.round(width * scale));
	canvas.height = Math.max(1, Math.round(height * scale));

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
}

async function toImageData(source, maxSize) {
	if (typeof ImageData !== "undefined" && source instanceof ImageData) {
		return source;
	}

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d", { willReadFrequently: true });

	if (
		typeof HTMLImageElement !== "undefined" &&
		source instanceof HTMLImageElement
	) {
		await ensureImageLoaded(source);
		drawScaled(ctx, canvas, source, maxSize);
	} else if (
		typeof HTMLCanvasElement !== "undefined" &&
		source instanceof HTMLCanvasElement
	) {
		drawScaled(ctx, canvas, source, maxSize);
	} else if (
		typeof ImageBitmap !== "undefined" &&
		source instanceof ImageBitmap
	) {
		drawScaled(ctx, canvas, source, maxSize);
	} else if (typeof Blob !== "undefined" && source instanceof Blob) {
		const url = URL.createObjectURL(source);
		try {
			drawScaled(ctx, canvas, await loadImage(url), maxSize);
		} finally {
			URL.revokeObjectURL(url);
		}
	} else if (typeof source === "string") {
		drawScaled(ctx, canvas, await loadImage(source), maxSize);
	} else {
		throw new TypeError("colors.js: unsupported image source");
	}

	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function buildBuckets(data, options) {
	const {
		bits,
		sampleStep,
		alphaThreshold,
		ignoreWhite,
		ignoreBlack,
		whiteThreshold,
		blackThreshold,
	} = options;
	const shift = 8 - bits;
	const mask = (1 << bits) - 1;
	const stride = 4 * sampleStep;
	const buckets = new Map();

	for (let i = 0; i < data.length; i += stride) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		if (data[i + 3] < alphaThreshold) continue;

		if (ignoreWhite && Math.min(r, g, b) / 255 >= whiteThreshold) continue;
		if (ignoreBlack && Math.max(r, g, b) / 255 <= blackThreshold) continue;

		const key =
			(((r >> shift) & mask) << (bits * 2)) |
			(((g >> shift) & mask) << bits) |
			((b >> shift) & mask);

		let bucket = buckets.get(key);
		if (!bucket) {
			bucket = { count: 0, r: 0, g: 0, b: 0 };
			buckets.set(key, bucket);
		}
		bucket.count += 1;
		bucket.r += r;
		bucket.g += g;
		bucket.b += b;
	}

	return buckets;
}

function bucketPoints(buckets) {
	const points = [];
	for (const bucket of buckets.values()) {
		points.push({
			lab: rgbToLab({
				r: bucket.r / bucket.count,
				g: bucket.g / bucket.count,
				b: bucket.b / bucket.count,
			}),
			weight: bucket.count,
		});
	}
	return points;
}

function nearestCentroid(lab, centroids, lightnessWeight) {
	let best = 0;
	let bestDistance = Infinity;
	for (let i = 0; i < centroids.length; i++) {
		const distance = labDistance(lab, centroids[i], lightnessWeight);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = i;
		}
	}
	return best;
}

function nearestDistance(lab, centroids, lightnessWeight) {
	let best = Infinity;
	for (const centroid of centroids) {
		const distance = labDistance(lab, centroid, lightnessWeight);
		if (distance < best) best = distance;
	}
	return best;
}

function farthestPoint(points, centroids, lightnessWeight) {
	let best = points[0];
	let bestDistance = -1;
	for (const point of points) {
		const distance = nearestDistance(point.lab, centroids, lightnessWeight);
		if (distance > bestDistance) {
			bestDistance = distance;
			best = point;
		}
	}
	return best;
}

function pickWeighted(points, totalWeight) {
	let target = Math.random() * totalWeight;
	for (const point of points) {
		target -= point.weight;
		if (target <= 0) return point;
	}
	return points[points.length - 1];
}

function seedCentroids(points, k, lightnessWeight) {
	const totalWeight = points.reduce((sum, point) => sum + point.weight, 0);
	const centroids = [pickWeighted(points, totalWeight).lab];

	while (centroids.length < k) {
		let total = 0;
		const weights = points.map((point) => {
			const distance = nearestDistance(point.lab, centroids, lightnessWeight);
			const weight = distance * distance * point.weight;
			total += weight;
			return weight;
		});

		if (total === 0) {
			centroids.push(points[centroids.length % points.length].lab);
			continue;
		}

		let target = Math.random() * total;
		let index = weights.length - 1;
		for (let i = 0; i < weights.length; i++) {
			target -= weights[i];
			if (target <= 0) {
				index = i;
				break;
			}
		}
		centroids.push(points[index].lab);
	}

	return centroids;
}

function kmeans(points, k, { lightnessWeight = 1, maxIterations = 20 } = {}) {
	if (points.length <= k) {
		return points.map((point) => ({
			lab: { ...point.lab },
			weight: point.weight,
		}));
	}

	let centroids = seedCentroids(points, k, lightnessWeight);
	const assignments = new Array(points.length).fill(-1);

	for (let iteration = 0; iteration < maxIterations; iteration++) {
		let changed = false;

		for (let i = 0; i < points.length; i++) {
			const nearest = nearestCentroid(
				points[i].lab,
				centroids,
				lightnessWeight,
			);
			if (assignments[i] !== nearest) {
				assignments[i] = nearest;
				changed = true;
			}
		}

		if (!changed && iteration > 0) break;

		const sums = centroids.map(() => ({ L: 0, a: 0, b: 0, weight: 0 }));
		for (let i = 0; i < points.length; i++) {
			const sum = sums[assignments[i]];
			const { lab, weight } = points[i];
			sum.L += lab.L * weight;
			sum.a += lab.a * weight;
			sum.b += lab.b * weight;
			sum.weight += weight;
		}

		centroids = sums.map((sum, index) => {
			if (sum.weight === 0) {
				return farthestPoint(points, centroids, lightnessWeight).lab;
			}
			return {
				L: sum.L / sum.weight,
				a: sum.a / sum.weight,
				b: sum.b / sum.weight,
			};
		});
	}

	const clusters = centroids.map((lab) => ({ lab, weight: 0 }));
	for (let i = 0; i < points.length; i++) {
		clusters[assignments[i]].weight += points[i].weight;
	}

	return clusters.filter((cluster) => cluster.weight > 0);
}

function mergeClusters(clusters, count, lightnessWeight) {
	const merged = clusters.map((cluster) => ({
		lab: { ...cluster.lab },
		weight: cluster.weight,
	}));

	while (merged.length > count) {
		let leftIndex = 0;
		let rightIndex = 1;
		let closest = Infinity;

		for (let i = 0; i < merged.length; i++) {
			for (let j = i + 1; j < merged.length; j++) {
				const distance = labDistance(
					merged[i].lab,
					merged[j].lab,
					lightnessWeight,
				);
				if (distance < closest) {
					closest = distance;
					leftIndex = i;
					rightIndex = j;
				}
			}
		}

		const left = merged[leftIndex];
		const right = merged[rightIndex];
		const weight = left.weight + right.weight;
		const lab = {
			L: (left.lab.L * left.weight + right.lab.L * right.weight) / weight,
			a: (left.lab.a * left.weight + right.lab.a * right.weight) / weight,
			b: (left.lab.b * left.weight + right.lab.b * right.weight) / weight,
		};

		merged.splice(rightIndex, 1);
		merged.splice(leftIndex, 1);
		merged.push({ lab, weight });
	}

	return merged;
}

export async function extractPalette(source, options = {}) {
	const settings = {
		count: 6,
		maxSize: 160,
		sampleStep: 3,
		bits: 5,
		alphaThreshold: 125,
		ignoreWhite: false,
		ignoreBlack: false,
		whiteThreshold: 0.95,
		blackThreshold: 0.05,
		lightnessWeight: 1,
		...options,
	};

	if (!Number.isInteger(settings.count) || settings.count < 1) {
		throw new RangeError("colors.js: `count` must be a positive integer");
	}

	settings.bits = Math.min(8, Math.max(1, Math.round(settings.bits)));
	settings.sampleStep = Math.max(1, Math.round(settings.sampleStep));

	const imageData = await toImageData(source, settings.maxSize);
	const points = bucketPoints(buildBuckets(imageData.data, settings));

	if (points.length === 0) {
		throw new Error("colors.js: no usable pixels found in the image");
	}

	const totalWeight = points.reduce((sum, point) => sum + point.weight, 0);
	const workingK = Math.min(points.length, settings.count * 2);
	const clusters = kmeans(points, workingK, settings);
	const merged = mergeClusters(
		clusters,
		Math.min(settings.count, points.length),
		settings.lightnessWeight,
	);
	merged.sort((a, b) => b.weight - a.weight);

	return merged.map((cluster) => {
		const rgb = labToRgb(cluster.lab);
		return {
			hex: rgbToHex(rgb),
			rgb,
			lab: cluster.lab,
			population: cluster.weight,
			ratio: totalWeight === 0 ? 0 : cluster.weight / totalWeight,
		};
	});
}

export function paletteToHex(palette) {
	return palette.map((color) =>
		typeof color === "string" ? color : color.hex,
	);
}

export function createTheme(palette, extra = {}) {
	if (!palette || palette.length === 0) return { ...extra };

	const colors = palette.map((color) =>
		typeof color === "string" ? hexToRgb(color) : color.rgb,
	);
	const labs = colors.map(rgbToLab);

	const byLuminance = [...colors].sort(
		(a, b) => relativeLuminance(a) - relativeLuminance(b),
	);
	const darkest = byLuminance[0];
	const lightest = byLuminance[byLuminance.length - 1];
	const mid = byLuminance[Math.floor(byLuminance.length / 2)];

	let accent = colors[0];
	let bestChroma = -1;
	for (let i = 0; i < colors.length; i++) {
		if (colors[i] === darkest && colors.length > 1) continue;
		const value = chroma(labs[i]);
		if (value > bestChroma) {
			bestChroma = value;
			accent = colors[i];
		}
	}

	const windowBackground = lighten(lightest, 0.5);
	const textBase = desaturate(darken(darkest, 0.1), 0.5);
	const textLight = lighten(desaturate(lightest, 0.7), 0.75);

	return {
		"--window-background": rgbToHex(windowBackground),
		"--window-border-light": rgbToHex(lighten(accent, 0.55)),
		"--window-border-dark": rgbToHex(darken(accent, 0.15)),
		"--interactive-background-light": rgbToHex(lighten(mid, 0.55)),
		"--interactive-background-dark": rgbToHex(darken(mid, 0.1)),
		"--interactive-border-light": rgbToHex(lighten(mid, 0.7)),
		"--interactive-border-dark": rgbToHex(darken(mid, 0.3)),
		"--interactive-select": rgbToHex(lighten(mid, 0.3)),
		"--text": readableText(windowBackground, textBase),
		"--text-grey": readableGray(windowBackground),
		"--text-light": rgbToHex(textLight),
		"--link": readableText(windowBackground, accent),
		"--link-hover": rgbToHex(darken(accent, 0.35)),
		...extra,
	};
}

export function applyTheme(theme, target = document.documentElement) {
	for (const [property, value] of Object.entries(theme)) {
		target.style.setProperty(property, value);
	}
	return target;
}

export async function themeFromImage(source, options = {}) {
	const { count = 6, ...rest } = options;
	const palette = await extractPalette(source, { count, ...rest });
	return { palette, theme: createTheme(palette) };
}
