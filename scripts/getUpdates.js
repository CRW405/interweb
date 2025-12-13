const url = "https://api.github.com/repos/CRW405/interweb/commits";

async function getUpdates() {
  const response = await fetch(url);
  const data = await response.json();

  const formattedCommits = data.map((commit) => ({
    message: commit.commit.message,
    timestamp: commit.commit.author.date,
    stats: {
      additions: commit.stats?.additions,
      deletions: commit.stats?.deletions,
      total: commit.stats?.total,
    },
    link: commit.html_url,
  }));
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
