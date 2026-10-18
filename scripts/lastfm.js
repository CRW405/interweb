import { themeElementFromImage } from "./imageTheme.js";

const USERNAME = "CRW405"; // Put your LastFM username here
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

let themedCover = null;
let currentTrack = null;
let currentCover = "";
let refreshInProgress = false;

const wait = (milliseconds) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchTrack = async () => {
	let lastError;

	for (let attempt = 0; attempt < 3; attempt += 1) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(BASE_URL, {
				cache: "no-store",
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`Last.fm request failed with ${response.status}`);
			}

			const json = await response.json();
			const track = json?.track;

			if (
				!track ||
				typeof track.name !== "string" ||
				typeof track.artist?.["#text"] !== "string" ||
				typeof track.url !== "string"
			) {
				throw new Error("Last.fm returned an incomplete track");
			}

			return track;
		} catch (error) {
			lastError = error;
			if (attempt < 2) await wait(1000);
		} finally {
			clearTimeout(timeout);
		}
	}

	throw lastError;
};

const getCover = (track) =>
	[...(track.image || [])]
		.reverse()
		.map((image) => image?.["#text"])
		.find((cover) => typeof cover === "string" && cover) || "";

const getTrack = async () => {
	if (refreshInProgress) return;
	refreshInProgress = true;
	const listening = document.getElementById("listening");

	try {
		const track = await fetchTrack();

		const nowPlaying = track["@attr"]?.nowplaying;
		const isPlaying = nowPlaying === "true" || nowPlaying === true;
		const heading = isPlaying ? "Now playing" : "Last played";
		const playedAt = isPlaying ? "" : track.date?.["#text"] || "";
		const trackKey = `${track.url}|${track.name}|${track.artist["#text"]}`;
		const trackState = `${trackKey}|${heading}|${playedAt}`;
		const cover = getCover(track);

		// Do not replace valid content when the API temporarily omits its image.
		const sameTrack = currentTrack?.startsWith(`${trackKey}|`);
		const displayedCover = cover || (sameTrack ? currentCover : "");
		if (trackState === currentTrack && displayedCover === currentCover) return;

		console.log(
			`${heading}: ${track.name} by ${track.artist["#text"]}${
				playedAt ? ` (${playedAt})` : ""
			}`,
		);

		const img = displayedCover ? `<img src="${displayedCover}">` : "";

		listening.innerHTML = `
    <h2>${heading}</h2>

    ${playedAt ? `<p id="playedAt">${playedAt}</p>` : ""}

    <a href="${track.url}" target="_blank" rel="noopener noreferrer">
        ${img}
        <div id="trackInfo">
            <h3 id="trackName">${track.name}</h3>
            <h4 id="artistName">${track.artist["#text"]}</h4>
        </div>
    </a>
    `;

		currentTrack = trackState;
		currentCover = displayedCover;

		if (displayedCover && displayedCover !== themedCover) {
			themedCover = displayedCover;
			themeElementFromImage(
				document.getElementById("lastfm-window"),
				displayedCover,
			);
		}
	} catch (error) {
		console.error("Could not load Last.fm track:", error);
		if (!currentTrack) {
			document.getElementById("listening").innerHTML =
				"<h2>Couldn't load listening info</h2>";
		}
	} finally {
		refreshInProgress = false;
	}
};

getTrack();
setInterval(getTrack, 60000); // Refresh every 60 seconds
