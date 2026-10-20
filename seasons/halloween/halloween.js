import { theme as halloweenTheme } from "./theme.js";

const asset = (name) => new URL(`../../medias/halloween/${name}`, import.meta.url).href;
const state = {
	active: false,
	timers: [],
	intervals: [],
	listeners: [],
	nodes: new Set(),
	audio: new Map(),
	animationFrames: new Set(),
	drips: new Map(),
	pumpkins: new Set(),
	clockClicks: 0,
	clockClickTimer: null,
	audioUnlocked: false,
};

export const theme = {
	"--wallpaper-image": `url("${new URL("../../medias/bg/halloween.jpg", import.meta.url).href}")`,
	...halloweenTheme,
};

const random = (min, max) => Math.random() * (max - min) + min;
const later = (callback, delay) => {
	const timer = window.setTimeout(callback, delay);
	state.timers.push(timer);
	return timer;
};

function addNode(node) {
	state.nodes.add(node);
	document.body.append(node);
	return node;
}

function playFresh(name) {
	const audio = state.audio.get(name) || new Audio(asset(name));
	audio.preload = "auto";
	state.audio.set(name, audio);
	audio.currentTime = 0;
	audio.play().catch(() => {});
	audio.addEventListener("ended", () => audio.remove(), { once: true });
}

function unlockAudio() {
	if (state.audioUnlocked) return;
	state.audioUnlocked = true;
	["blood.mp3", "scream.mp3", "bad-to-the-bone.mp3"].forEach((name) => {
		const audio = state.audio.get(name) || new Audio(asset(name));
		audio.muted = true;
		audio.play()
			.then(() => {
				audio.pause();
				audio.currentTime = 0;
				audio.muted = false;
			})
			.catch(() => {
				audio.muted = false;
			});
		state.audio.set(name, audio);
	});
}

function listen(target, event, handler, options) {
	target.addEventListener(event, handler, options);
	state.listeners.push(() => target.removeEventListener(event, handler, options));
}

function play(name) {
	let audio = state.audio.get(name);
	if (!audio) {
		audio = new Audio(asset(name));
		audio.preload = "auto";
		state.audio.set(name, audio);
	}
	audio.currentTime = 0;
	audio.play().catch(() => {});
}

function createImage(className, filename, alt = "") {
	const image = document.createElement("img");
	image.className = className;
	image.src = asset(filename);
	image.alt = alt;
	image.draggable = false;
	return image;
}

function showBlood(event) {
	const blood = addNode(createImage("halloween-effect halloween-blood", "blood.png"));
	blood.style.left = `${event.clientX}px`;
	blood.style.top = `${event.clientY}px`;
	later(() => {
		blood.style.opacity = "0";
		blood.style.transform = "translate(-18%, -18%) scale(.72)";
	}, 20);
	later(() => blood.remove(), 3000);
	play("blood.mp3");
	if (Math.random() < 0.1) play("scream.mp3");
}

function showSkeleton() {
	if (!state.active || document.querySelector(".halloween-skeleton")) return;
	const skeleton = addNode(createImage("halloween-effect halloween-skeleton", "skeletonrunning.gif"));
	playFresh("bad-to-the-bone.mp3");
	later(() => {
		skeleton.remove();
		state.nodes.delete(skeleton);
	}, 4000);
}

function spawnGhost() {
	if (!state.active || document.querySelectorAll(".halloween-ghost").length >= 3) return;
	const ghost = addNode(createImage("halloween-effect halloween-ghost", "ghost.gif"));
	let x = random(0, Math.max(0, window.innerWidth - 150));
	let y = random(40, Math.max(40, window.innerHeight - 150));
	let dx = random(-0.7, 0.7);
	let dy = random(-0.7, 0.7);
	const started = performance.now();
	const move = (now) => {
		if (!state.active || !ghost.isConnected) return;
		const width = ghost.offsetWidth || 100;
		const height = ghost.offsetHeight || 100;
		x += dx;
		y += dy;
		if (x <= 0 || x + width >= window.innerWidth) dx *= -1;
		if (y <= 0 || y + height >= window.innerHeight) dy *= -1;
		ghost.style.left = `${Math.max(0, x)}px`;
		ghost.style.top = `${Math.max(0, y)}px`;
		ghost.style.transform = `rotate(${Math.sin(now / 650) * 8}deg)`;
		if (now - started > 9000) ghost.style.opacity = "0";
		const frame = requestAnimationFrame(move);
		state.animationFrames.add(frame);
	};
	state.animationFrames.add(requestAnimationFrame(move));
	later(() => {
		ghost.remove();
		state.nodes.delete(ghost);
	}, 11000);
}

function spawnBat() {
	const bat = addNode(createImage("halloween-effect halloween-bat", "bat.gif"));
	let x = random(0, Math.max(0, window.innerWidth - 140));
	let y = random(0, Math.max(0, window.innerHeight - 100));
	let dx = random(1.2, 2.5) * (Math.random() < 0.5 ? -1 : 1);
	let dy = random(0.8, 1.8) * (Math.random() < 0.5 ? -1 : 1);
	const move = () => {
		if (!state.active || !bat.isConnected) return;
		const width = bat.offsetWidth || 100;
		const height = bat.offsetHeight || 70;
		x += dx;
		y += dy;
		if (x <= 0 || x + width >= window.innerWidth) dx *= -1;
		if (y <= 0 || y + height >= window.innerHeight) dy *= -1;
		bat.style.left = `${Math.max(0, x)}px`;
		bat.style.top = `${Math.max(0, y)}px`;
		bat.style.transform = `scaleX(${dx < 0 ? -1 : 1})`;
		const frame = requestAnimationFrame(move);
		state.animationFrames.add(frame);
	};
	state.animationFrames.add(requestAnimationFrame(move));
	later(() => {
		bat.remove();
		state.nodes.delete(bat);
	}, 20000);
}

function addPumpkins() {
	const pumpkinTargets = ["#welcome", "#controls", "#status"];
	pumpkinTargets.forEach((selector) => {
		const windowElement = document.querySelector(
			`${selector}:not([floating]):not(.image-window)`,
		);
		if (!windowElement || windowElement.querySelector(":scope > .halloween-pumpkin")) {
			return;
		}
		const pumpkin = createImage("halloween-pumpkin", "pumpkin.gif");
		pumpkin.setAttribute("aria-hidden", "true");
		windowElement.append(pumpkin);
		state.pumpkins.add(pumpkin);
	});
}

function addDrips() {
	document.querySelectorAll("window").forEach((windowElement) => {
		if (state.drips.has(windowElement)) return;
		const drip = addNode(createImage("halloween-effect halloween-drip", "blooddrip.gif"));
		drip.setAttribute("aria-hidden", "true");
		state.drips.set(windowElement, drip);
	});
	updateDrips();
}

function updateDrips() {
	state.drips.forEach((drip, windowElement) => {
		const status = windowElement.getAttribute("status");
		if (
			!windowElement.isConnected ||
			windowElement.hidden ||
			status === "closed" ||
			status === "minimized"
		) {
			drip.hidden = true;
			return;
		}
		const rect = windowElement.getBoundingClientRect();
		const parentZIndex = Number.parseInt(getComputedStyle(windowElement).zIndex, 10);
		drip.hidden = false;
		drip.style.left = `${rect.left}px`;
		drip.style.top = `${rect.bottom - 1}px`;
		drip.style.width = `${rect.width}px`;
		drip.style.zIndex = String(Number.isFinite(parentZIndex) ? parentZIndex + 1 : 1);
	});
}

function restore() {
	if (!state.active) return;
	state.active = false;
	state.timers.forEach(clearTimeout);
	state.intervals.forEach(clearInterval);
	state.timers = [];
	state.intervals = [];
	state.animationFrames.forEach(cancelAnimationFrame);
	state.animationFrames.clear();
	state.listeners.forEach((remove) => remove());
	state.listeners = [];
	state.audio.forEach((audio) => {
		audio.pause();
		audio.removeAttribute("src");
	});
	state.nodes.forEach((node) => node.remove());
	state.nodes.clear();
	state.drips.clear();
	state.pumpkins.forEach((pumpkin) => pumpkin.remove());
	state.pumpkins.clear();
	state.audio.clear();
	state.audioUnlocked = false;
	state.clockClicks = 0;
	if (state.clockClickTimer) clearTimeout(state.clockClickTimer);
	state.clockClickTimer = null;
}

function startHalloween() {
	if (state.active) return;
	state.active = true;

	listen(document, "click", unlockAudio, true);
	listen(document, "click", (event) => {
		const button = event.target instanceof Element
			? event.target.closest("button")
			: null;
		if (button && !button.closest("[data-season-toggle]")) showBlood(event);
	}, true);
	listen(document, "click", (event) => {
		const target = event.target instanceof Element
			? event.target.closest(".time, .taskbar-calendar")
			: null;
		if (!target) return;
		state.clockClicks += 1;
		if (state.clockClickTimer) clearTimeout(state.clockClickTimer);
		state.clockClickTimer = window.setTimeout(() => {
			state.clockClicks = 0;
		}, 1500);
		if (state.clockClicks >= 5) {
			state.clockClicks = 0;
			clearTimeout(state.clockClickTimer);
			state.clockClickTimer = null;
			showSkeleton();
		}
	}, true);
	state.intervals.push(window.setInterval(() => {
		if (Math.random() < 0.01) showSkeleton();
	}, 1000));
	state.intervals.push(window.setInterval(spawnGhost, 6500));
	state.intervals.push(window.setInterval(spawnBat, 18000));
	const observer = new MutationObserver(addDrips);
	observer.observe(document.body, { childList: true, subtree: true });
	state.listeners.push(() => observer.disconnect());
	listen(window, "scroll", updateDrips, { passive: true });
	listen(window, "resize", updateDrips);
	state.intervals.push(window.setInterval(updateDrips, 250));
	addDrips();
	addPumpkins();
	spawnGhost();
	spawnBat();
}

export const season = {
	start: startHalloween,
	stop: restore,
};
