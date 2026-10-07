import { themeElementFromImage } from "./imageTheme.js";

const USERNAME = "CRW405"; // Put your LastFM username here
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

let themedCover = null;

const getTrack = async () => {
	const listening = document.getElementById("listening");

	try {
		const request = await fetch(BASE_URL);
		const json = await request.json();
		const track = json.track;

		const nowPlaying = track["@attr"]?.nowplaying;
		const isPlaying = nowPlaying === "true" || nowPlaying === true;
		const heading = isPlaying ? "Now playing" : "Last played";
		const playedAt = isPlaying ? "" : track.date?.["#text"] || "";

		console.log(
			`${heading}: ${track.name} by ${track.artist["#text"]}${
				playedAt ? ` (${playedAt})` : ""
			}`,
		);

		const cover = track.image?.[1]?.["#text"] || "";
		const img = cover ? `<img src="${cover}">` : "";

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

		if (cover && cover !== themedCover) {
			themedCover = cover;
			themeElementFromImage(document.getElementById("lastfm-window"), cover);
		}
	} catch (error) {
		console.error("Could not load Last.fm track:", error);
		listening.innerHTML = `<h2>Couldn't load listening info</h2>`;
	}
};

getTrack();
setInterval(getTrack, 60000); // Refresh every 60 seconds
