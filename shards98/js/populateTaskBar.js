export { refreshTasks, populateTaskBar };

const taskBar = document.querySelector("taskbar");
const taskList = taskBar.querySelector(".tasks");
const startDiv = taskBar.querySelector(".start-menu");
const startList = startDiv.querySelector(".start-list");
const start = taskBar.querySelector("img");

const allWindows = document.querySelectorAll("window");

function populateTaskBar() {
  start.addEventListener("click", () => {
    startDiv.style.display =
      startDiv.style.display == "block" ? "none" : "block";
  });

  // populate start menu
  for (const window of allWindows) {
    let li = document.createElement("li");
    let name = window.getAttribute("name");

    switch (window.getAttribute("status")) {
      case "closed":
        window.style.display = "none";
        break;
      case "minimized":
        window.style.display = "none";
        break;
      default:
        window.setAttribute("status", "opened");
    }

    li.textContent = name;

    li.addEventListener("click", () => {
      if (getComputedStyle(window).display == "block") {
        window.style.display = "none";
        window.setAttribute("status", "minimized");
        if (window.classList.contains("maximized")) {
          window.classList.remove("maximized");
        }
      } else {
        window.style.display = "block";
        window.setAttribute("status", "opened");
      }
      refreshTasks();
    });

    startList.appendChild(li);
  }
}

// populate task bar with minimized windows
function refreshTasks() {
  const minimizedWindows = document.querySelectorAll(
    "window[status='minimized']",
  );
  const openedWindows = document.querySelectorAll("window[status='opened']");

  taskList.innerHTML = "";

  const allTaskWindows = [...minimizedWindows, ...openedWindows];
  const allWindowsArray = Array.from(document.querySelectorAll("window"));

  // Sort by DOM order
  allTaskWindows.sort(
    (a, b) => allWindowsArray.indexOf(a) - allWindowsArray.indexOf(b),
  );

  for (const window of allTaskWindows) {
    let li = document.createElement("li");
    let name = window.getAttribute("name");
    let span = document.createElement("span");
    let closeBtn = document.createElement("button");

    span.textContent = name;
    closeBtn.textContent = "X";
    closeBtn.className = "close-btn";

    span.addEventListener("click", () => {
      if (getComputedStyle(window).display == "block") {
        window.style.display = "none";
        window.setAttribute("status", "minimized");
        if (window.classList.contains("maximized")) {
          window.classList.remove("maximized");
        }
      } else {
        window.style.display = "block";
        window.setAttribute("status", "opened");
      }
      refreshTasks();
    });

    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      window.style.display = "none";
      window.setAttribute("status", "closed");
      if (window.classList.contains("maximized")) {
        window.classList.remove("maximized");
      }
      refreshTasks();
    });

    if (window.getAttribute("status") == "minimized") {
      li.style.backgroundColor = "var(--interactive-background-dark)";
    } else {
      li.style.backgroundColor = "var(--interactive-background-light)";
    }

    li.appendChild(span);
    li.appendChild(closeBtn);
    taskList.appendChild(li);
  }
}

populateTaskBar();
refreshTasks();
