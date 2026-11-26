import { readableText } from "./colors.js";

const audio = document.querySelector("#music-audio");
const title = document.querySelector("#music-title");
const previousButton = document.querySelector("#music-previous");
const playButton = document.querySelector("#music-play");
const nextButton = document.querySelector("#music-next");
const progress = document.querySelector("#music-progress");
const volume = document.querySelector("#music-volume");
const time = document.querySelector("#music-time");
const visualizer = document.querySelector("#music-visualizer");
const visualizerStatus = document.querySelector("#music-visualizer-status");
const albumSelect = document.querySelector("#music-album");
const cover = document.querySelector("#music-cover");

const albums = [
	{
		title: "Other",
		tracks: ["WRLD - CASTCADIA.mp3", "soundboy - Accelio.mp3"],
	},
	{
		title: "Easy Delivery Co. OST",
		folder: "Easy_Delivery_Co_OST",
		cover: "Easy_Delivery_Co_OST.webp",
		tracks: [
			"01 - SOHAOYING - Easy Delivery Co. OST - Rainless.mp3",
			"02 - pr0te - Easy Delivery Co. OST - Same Day Delivery.mp3",
			"03 - SOHAOYING - Easy Delivery Co. OST - Rainless (Hum).mp3",
			"04 - pr0te - Easy Delivery Co. OST - Parcel Dreams.mp3",
			"05 - SOHAOYING - Easy Delivery Co. OST - Shut Down.mp3",
			"06 - SOHAOYING - Easy Delivery Co. OST - Rest.mp3",
			"07 - SOHAOYING - Easy Delivery Co. OST - Chilling on Company Time.mp3",
			"08 - SOHAOYING - Easy Delivery Co. OST - Snowdrifting.mp3",
			"09 - SOHAOYING - Easy Delivery Co. OST - Cruising.mp3",
			"10 - SOHAOYING - Easy Delivery Co. OST - Factory Settings.mp3",
			"11 - SOHAOYING - Easy Delivery Co. OST - Are Auroras Real.mp3",
			"12 - SOHAOYING - Easy Delivery Co. OST - Easily Delivered or Whatever.mp3",
			"13 - SOHAOYING - Easy Delivery Co. OST - Roadside Mud.mp3",
			"14 - pr0te - Easy Delivery Co. OST - Track & Trace.mp3",
			"15 - pr0te - Easy Delivery Co. OST - Sunset Logistics.mp3",
			"16 - pr0te - Easy Delivery Co. OST - Final Dispatch.mp3",
			"17 - pr0te - Easy Delivery Co. OST - Subzero Shipping.mp3",
			"18 - pr0te - Easy Delivery Co. OST - Sender Unknown.mp3",
			"19 - pr0te - Easy Delivery Co. OST - Freight Across The Galaxy.mp3",
			"20 - pr0te - Easy Delivery Co. OST - Lost Goods.mp3",
			"21 - pr0te - Easy Delivery Co. OST - Kei Thx Bye.mp3",
			"22 - SOHAOYING - Easy Delivery Co. OST - It's No Problem.mp3",
		],
	},
	{
		title: "Past Curfew",
		folder: "Midwest Post Death - Past Curfew",
		cover: "Past_Curfew.png",
		tracks: [
			"01 - Midwest Post Death - ☆.mp3",
			"02 - Midwest Post Death - fawn.mp3",
			"03 - Midwest Post Death - akhet.mp3",
			"04 - Midwest Post Death - letch.mp3",
			"05 - Midwest Post Death - eidolon.mp3",
			"06 - Midwest Post Death - xoanon.mp3",
			"07 - Midwest Post Death - past curfew.mp3",
			"08 - Midwest Post Death - ＊played for one＊.mp3",
			"09 - Midwest Post Death - firewatch.mp3",
			"10 - Midwest Post Death - chiro my love.mp3",
			"11 - Midwest Post Death - petal.mp3",
			"12 - Midwest Post Death - puso.mp3",
			"13 - Midwest Post Death - trainspotting.mp3",
		],
	},
];

if (
	audio &&
	title &&
	previousButton &&
	playButton &&
	nextButton &&
	progress &&
	volume &&
	time &&
	visualizer &&
	visualizerStatus &&
	albumSelect &&
	cover
) {
	const musicRoot = "./medias/sounds/music";
	const encodePath = (path) =>
		path.split("/").map((segment) => encodeURIComponent(segment)).join("/");

	// Folder names are either "Artist - Album" or a plain album name with
	// underscores standing in for spaces. "other" holds loose singles.
	const normalizeName = (value) =>
		value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
	const folderMetadata = (folder) => {
		const name = folder.replace(/_/g, " ").trim();
		if (name.toLowerCase() === "other") return {};
		const separator = name.indexOf(" - ");
		if (separator === -1) return { album: name };
		return {
			artist: name.slice(0, separator).trim(),
			album: name.slice(separator + 3).trim(),
		};
	};

	// Credit the artist from the folder in the album picker when the folder
	// name includes one and the album title doesn't already mention it.
	const albumLabel = (album) => {
		if (!album.folder) return album.title;
		const { artist } = folderMetadata(album.folder);
		if (!artist || album.title.includes(artist)) return album.title;
		return `${artist} - ${album.title}`;
	};

	const albumTracks = (album) => {
		const folder = album.folder ?? "other";
		const folderInfo = folderMetadata(folder);
		return album.tracks.map((file) => {
			// Filenames follow "NN - Artist - Album - Title.mp3", with the track
			// number and album segment being optional. Anything before the first
			// separator is the artist; when the filename has no artist segment,
			// fall back to the artist credited by the folder name.
			const parts = file
				.replace(/\.mp3$/i, "")
				.replace(/^\d+\s*-\s*/, "")
				.split(/\s+-\s+/)
				.filter(Boolean);
			const [first, ...remainder] = parts;
			const artist = parts.length > 1 ? first : (folderInfo.artist ?? "");
			let trackTitle = parts.length > 1 ? remainder.join(" - ") : first;
			if (
				remainder.length > 1 &&
				normalizeName(remainder[0]) === normalizeName(folderInfo.album ?? "")
			) {
				trackTitle = remainder.slice(1).join(" - ");
			}
			return {
				title: artist ? `${trackTitle} - ${artist}` : trackTitle,
				artist,
				trackTitle,
				src: encodePath(`${musicRoot}/${folder}/${file}`),
			};
		});
	};

	albums.forEach((album, index) => {
		const option = document.createElement("option");
		option.value = String(index);
		option.textContent = albumLabel(album);
		albumSelect.append(option);
	});

	let currentTrackIndex = 0;
	let currentAlbumIndex = Math.max(
		0,
		albums.findIndex((album) => album.title === "Easy Delivery Co. OST"),
	);
	let tracks = albumTracks(albums[currentAlbumIndex]);
	albumSelect.value = String(currentAlbumIndex);
	let audioContext;
	let analyser;
	let frequencyData;
	let visualizerFrame;
	let barGradientKey = "";
	let barGradientStops = ["#fff", "#fff"];

	const formatTime = (seconds) => {
		const totalSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
		const minutes = Math.floor(totalSeconds / 60);
		const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
		return `${minutes}:${remainingSeconds}`;
	};

	const updateRangeFill = (range) => {
		const min = Number(range.min);
		const max = Number(range.max);
		const value = Number(range.value);
		const fraction = max > min ? (value - min) / (max - min) : 0;
		const percent = Math.min(100, Math.max(0, fraction * 100));
		range.style.setProperty("--range-fill", `${percent}%`);
	};

	const updateTime = () => {
		const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
		progress.max = String(duration);
		progress.value = String(audio.currentTime);
		progress.disabled = duration === 0;
		updateRangeFill(progress);
		time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
	};

	const updatePlaybackButton = () => {
		playButton.textContent = audio.paused ? "Play" : "Pause";
		playButton.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
	};

	const drawVisualizer = () => {
		const bounds = visualizer.getBoundingClientRect();
		const pixelRatio = window.devicePixelRatio || 1;
		const width = Math.floor(bounds.width * pixelRatio);
		const height = Math.floor(bounds.height * pixelRatio);
		if (!width || !height) return;

		if (visualizer.width !== width || visualizer.height !== height) {
			visualizer.width = width;
			visualizer.height = height;
		}

		const context = visualizer.getContext("2d");
		if (!context) {
			visualizerStatus.hidden = false;
			visualizerStatus.textContent = "Audio visualization is unavailable.";
			return;
		}

		if (analyser && frequencyData && !audio.paused) {
			analyser.getByteFrequencyData(frequencyData);
		}

		const bands = Math.max(6, Math.min(24, Math.floor(width / (16 * pixelRatio))));
		const gap = Math.max(pixelRatio, width * 0.004);
		const sideWidth = (width - gap) / 2;
		const barWidth = (sideWidth - gap * (bands - 1)) / bands;
		const colors = getComputedStyle(document.documentElement);
		const background =
			colors.getPropertyValue("--window-background").trim() || "#fff";
		const dark = colors.getPropertyValue("--window-border-dark").trim();
		const light = colors.getPropertyValue("--window-border-light").trim();
		const key = `${background}|${dark}|${light}`;
		if (key !== barGradientKey) {
			barGradientKey = key;
			// Keep the theme's hues, but nudge each stop until it reads clearly
			// against the visualizer background (3:1 for graphical objects).
			barGradientStops = [
				readableText(background, dark, { minRatio: 3 }),
				readableText(background, light, { minRatio: 3 }),
			];
		}
		const gradient = context.createLinearGradient(0, height, 0, 0);
		gradient.addColorStop(0, barGradientStops[0]);
		gradient.addColorStop(1, barGradientStops[1]);

		context.clearRect(0, 0, width, height);
		context.fillStyle = gradient;
		const minBin = 2;
		const maxBin = (frequencyData?.length ?? 0) - 1;
		const binRange = maxBin > minBin ? maxBin / minBin : 1;

		for (let index = 0; index < bands; index += 1) {
			const startBin = Math.floor(minBin * binRange ** (index / bands));
			const endBin = Math.min(
				maxBin + 1,
				Math.max(
					startBin + 1,
					Math.floor(minBin * binRange ** ((index + 1) / bands)),
				),
			);
			let energy = 0;
			for (let bin = startBin; bin < endBin; bin += 1) {
				energy += frequencyData?.[bin] ?? 0;
			}
			energy /= Math.max(1, endBin - startBin) * 255;
			const amplitude = audio.paused
				? 0
				: Math.max(0, (energy - 0.015) / 0.985) ** 0.8;
			const barHeight = amplitude * height;
			const leftX = width / 2 - gap / 2 - (index + 1) * barWidth - index * gap;
			const rightX = width / 2 + gap / 2 + index * (barWidth + gap);
			const barY = height - barHeight;

			context.fillRect(leftX, barY, barWidth, barHeight);
			context.fillRect(rightX, barY, barWidth, barHeight);
		}

		if (!audio.paused) {
			visualizerFrame = requestAnimationFrame(drawVisualizer);
		} else {
			visualizerFrame = undefined;
		}
	};

	// While playing the animation loop already resizes the canvas; redraw on
	// resize when paused so its backing store stays in sync with the layout.
	const redrawVisualizer = () => {
		if (visualizerFrame === undefined) drawVisualizer();
	};
	window.addEventListener("resize", redrawVisualizer);
	if (window.ResizeObserver) {
		new ResizeObserver(redrawVisualizer).observe(visualizer);
	}

	const startVisualizer = async () => {
		if (visualizerFrame !== undefined) return;

		try {
			if (!audioContext) {
				const AudioContextConstructor =
					window.AudioContext || window.webkitAudioContext;
				if (!AudioContextConstructor) {
					visualizerStatus.hidden = false;
					visualizerStatus.textContent =
						"Audio visualization is not supported in this browser.";
					return;
				}

				audioContext = new AudioContextConstructor();
				analyser = audioContext.createAnalyser();
				analyser.fftSize = 2048;
				analyser.smoothingTimeConstant = 0.72;
				analyser.minDecibels = -90;
				analyser.maxDecibels = -20;
				frequencyData = new Uint8Array(analyser.frequencyBinCount);
				audioContext.createMediaElementSource(audio).connect(analyser);
				analyser.connect(audioContext.destination);
			}

			await audioContext.resume();
			visualizerStatus.hidden = true;
			drawVisualizer();
		} catch {
			visualizerStatus.hidden = false;
			visualizerStatus.textContent = "Audio visualization is unavailable.";
		}
	};

	const loadTrack = (index, resumePlayback = false) => {
		currentTrackIndex = (index + tracks.length) % tracks.length;
		const track = tracks[currentTrackIndex];
		const album = albums[currentAlbumIndex];

		audio.pause();
		audio.src = track.src;
		audio.load();
		title.textContent = track.title;
		cover.style.backgroundImage = album.cover
			? `url("${encodePath(`${musicRoot}/${album.folder}/${album.cover}`)}")`
			: "";
		cover.setAttribute("aria-label", `${albumLabel(album)} cover art`);
		progress.value = "0";
		progress.disabled = true;
		updateTime();

		if (resumePlayback) {
			audio.play().catch(() => {
				title.textContent = `Unable to play ${track.title}.`;
			});
		}
	};

	audio.volume = Number(volume.value);
	updateRangeFill(volume);
	audio.addEventListener("loadedmetadata", () => {
		updateTime();
		title.textContent = tracks[currentTrackIndex].title;
	});
	audio.addEventListener("timeupdate", updateTime);
	audio.addEventListener("durationchange", updateTime);
	audio.addEventListener("play", () => {
		updatePlaybackButton();
		void startVisualizer();
	});
	audio.addEventListener("pause", () => {
		updatePlaybackButton();
		if (visualizerFrame !== undefined) {
			cancelAnimationFrame(visualizerFrame);
			visualizerFrame = undefined;
		}
		drawVisualizer();
		visualizerStatus.hidden = false;
		visualizerStatus.textContent = "Play a track to start the visualizer.";
	});
	audio.addEventListener("ended", () => loadTrack(currentTrackIndex + 1, true));
	audio.addEventListener("error", () => {
		title.textContent = `Unable to load ${tracks[currentTrackIndex].title}.`;
		progress.disabled = true;
	});
	albumSelect.addEventListener("change", () => {
		currentAlbumIndex = Number(albumSelect.value);
		tracks = albumTracks(albums[currentAlbumIndex]);
		loadTrack(0, !audio.paused);
	});

	previousButton.addEventListener("click", () =>
		loadTrack(currentTrackIndex - 1, !audio.paused),
	);
	nextButton.addEventListener("click", () =>
		loadTrack(currentTrackIndex + 1, !audio.paused),
	);

	playButton.addEventListener("click", async () => {
		if (!audio.paused) {
			audio.pause();
			return;
		}

		try {
			await audio.play();
		} catch {
			title.textContent = `Unable to play ${tracks[currentTrackIndex].title}.`;
		}
	});

	progress.addEventListener("input", () => {
		audio.currentTime = Number(progress.value);
		updateRangeFill(progress);
	});

	volume.addEventListener("input", () => {
		audio.volume = Number(volume.value);
		updateRangeFill(volume);
	});

	loadTrack(currentTrackIndex);
	updatePlaybackButton();
	updateTime();
	drawVisualizer();
}
