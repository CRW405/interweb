const url = "https://api.github.com/repos/CRW405/interweb/commits";
const MAX_COMMITS = 5;
const CACHE_TTL = 60 * 60 * 1000;
const CACHE_KEY = "interweb:updates:v1";

const updateList = document.querySelector("#update-list");

function showMessage(text, className = "update-message") {
	if (!updateList) return;

	const li = document.createElement("li");
	li.className = className;
	li.textContent = text;
	updateList.replaceChildren(li);
}

function readCache() {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;

		const cache = JSON.parse(raw);
		if (!cache || !Array.isArray(cache.commits)) return null;
		return cache;
	} catch (error) {
		console.warn("Could not read updates cache:", error);
		return null;
	}
}

function writeCache(commits, details) {
	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ fetchedAt: Date.now(), commits, details }),
		);
	} catch (error) {
		console.warn("Could not write updates cache:", error);
	}
}

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: { Accept: "application/vnd.github+json" },
	});

	if (!response.ok) {
		const error = new Error(`GitHub request failed (${response.status})`);
		error.status = response.status;
		error.rateLimited = response.status === 403 || response.status === 429;
		throw error;
	}

	return response.json();
}

async function fetchDetails(commits, cachedDetails = {}) {
	const details = { ...cachedDetails };

	for (const commit of commits) {
		if (details[commit.sha]) continue;

		try {
			const detail = await fetchJson(commit.url);
			details[commit.sha] = detail.stats || {
				additions: 0,
				deletions: 0,
				total: 0,
			};
		} catch (error) {
			console.warn(`Could not load stats for commit ${commit.sha}:`, error);
			if (error.rateLimited) break;
		}
	}

	return details;
}

async function getUpdates() {
	const cached = readCache();

	if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
		return { commits: cached.commits, stale: false };
	}

	try {
		const data = await fetchJson(url);

		if (!Array.isArray(data)) {
			throw new Error("Unexpected response from GitHub");
		}

		const commits = data.slice(0, MAX_COMMITS);
		const details = await fetchDetails(commits, cached?.details);

		const formattedCommits = commits.map((commit) => {
			const stats = details[commit.sha] || {};

			return {
				message: commit.commit.message,
				timestamp: commit.commit.author.date,
				stats: {
					additions: stats.additions || 0,
					deletions: stats.deletions || 0,
					total: stats.total || 0,
				},
				link: commit.html_url,
			};
		});

		writeCache(formattedCommits, details);
		return { commits: formattedCommits, stale: false };
	} catch (error) {
		if (cached) {
			console.warn("Using cached updates after error:", error);
			return { commits: cached.commits, stale: true };
		}
		throw error;
	}
}

function renderCommits(commits, { stale = false } = {}) {
	if (!updateList) return;

	const items = [];

	if (stale) {
		const notice = document.createElement("li");
		notice.classList.add("update-notice");
		notice.textContent =
			"Showing cached updates — live data is unavailable right now.";
		items.push(notice);
	}

	commits.forEach((commit) => {
		const li = document.createElement("li");
		const anchor = document.createElement("a");
		const commitDiv = document.createElement("div");
		const header = document.createElement("h3");
		const timestamp = document.createElement("div");
		const statsDiv = document.createElement("div");
		const additions = document.createElement("span");
		const deletions = document.createElement("span");

		anchor.href = commit.link;
		anchor.target = "_blank";

		header.textContent = commit.message.trim();
		timestamp.textContent = new Date(commit.timestamp).toLocaleString();
		additions.textContent = `+${commit.stats.additions}`;
		deletions.textContent = `-${commit.stats.deletions}`;

		commitDiv.classList.add("update-commit");
		timestamp.classList.add("update-timestamp");
		statsDiv.classList.add("update-stats");
		additions.classList.add("update-additions");
		deletions.classList.add("update-deletions");

		statsDiv.appendChild(additions);
		statsDiv.appendChild(deletions);
		commitDiv.appendChild(header);
		commitDiv.appendChild(timestamp);
		commitDiv.appendChild(statsDiv);
		anchor.appendChild(commitDiv);
		li.appendChild(anchor);
		items.push(li);
	});

	updateList.replaceChildren(...items);
}

if (updateList) {
	showMessage("Loading updates…");

	getUpdates()
		.then(({ commits, stale }) => {
			if (commits.length === 0) {
				showMessage("No updates yet.");
				return;
			}
			renderCommits(commits, { stale });
		})
		.catch((error) => {
			console.error("Failed to load updates:", error);
			showMessage(
				error.rateLimited
					? "Updates are unavailable right now because GitHub is rate limiting requests. Please try again later."
					: "Updates could not be loaded. Please try again later.",
				"update-error",
			);
		});
} else {
	console.error("Could not find #update-list to render updates.");
}
