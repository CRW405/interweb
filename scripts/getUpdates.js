const url = "https://api.github.com/repos/CRW405/interweb/commits";

async function getUpdates() {
  const response = await fetch(url);
  const data = await response.json();

  const formattedCommits = await Promise.all(
    data.slice(0, 10).map(async (commit) => {
      const detailResponse = await fetch(commit.url);
      const detail = await detailResponse.json();

      return {
        message: commit.commit.message,
        timestamp: commit.commit.author.date,
        stats: {
          additions: detail.stats?.additions || 0,
          deletions: detail.stats?.deletions || 0,
          total: detail.stats?.total || 0,
        },
        link: commit.html_url,
      };
    }),
  );
  return formattedCommits;
}

getUpdates().then((commits) => {
  const updates = document.querySelector("#update-list");

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
    header.textContent = commit.message;
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
    updates.appendChild(li);
  });
});

// #TODO:
// - style updates
