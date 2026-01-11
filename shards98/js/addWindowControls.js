import { refreshTasks } from "./populateTaskBar.js";
export { addWindowControls };

function addWindowControls() {
  const decorations = ["_", "◻", "X"];
  // const decorations = ["_", "X"];

  let elements = document.querySelectorAll("window");

  elements.forEach((element) => {
    let container = document.createElement("window-controls");

    for (const decoration of decorations) {
      let button = document.createElement("button");
      button.textContent = decoration;

      switch (decoration) {
        case "◻":
          button.addEventListener("click", (event) => {
            let button = event.currentTarget;
            let windowElement = button.parentElement.parentElement;
            if (windowElement.getAttribute("status") === "maximized") {
              if (windowElement.hasAttribute("floating")) {
                windowElement.style.position = "absolute";
                // Restore saved position
                if (windowElement.dataset.savedTop) {
                  windowElement.style.top = windowElement.dataset.savedTop;
                  windowElement.style.left = windowElement.dataset.savedLeft;
                  windowElement.style.width = windowElement.dataset.savedWidth;
                  windowElement.style.height =
                    windowElement.dataset.savedHeight;
                }
              }
              windowElement.setAttribute("status", "opened");
              windowElement.classList.remove("maximized");
              button.innerHTML = "◻";
            } else {
              if (windowElement.hasAttribute("floating")) {
                // Save current position before maximizing (use computed styles)
                const computed = getComputedStyle(windowElement);
                windowElement.dataset.savedTop =
                  windowElement.style.top || computed.top;
                windowElement.dataset.savedLeft =
                  windowElement.style.left || computed.left;
                windowElement.dataset.savedWidth =
                  windowElement.style.width || computed.width;
                windowElement.dataset.savedHeight =
                  windowElement.style.height || computed.height;
                windowElement.style.top = "0";
                windowElement.style.left = "0";
                windowElement.style.width = "100%";
                windowElement.style.height = "100%";
                windowElement.style.position = "fixed";
              }
              windowElement.setAttribute("status", "maximized");
              windowElement.classList.add("maximized");
              button.innerHTML = '<span class="maximized-icon">⧉</span>';
            }
          });
          break;
        case "_":
          button.addEventListener("click", (event) => {
            let button = event.currentTarget;
            button.parentElement.parentElement.style.display = "none";
            button.parentElement.parentElement.setAttribute(
              "status",
              "minimized",
            );
            if (
              button.parentElement.parentElement.classList.contains("maximized")
            ) {
              button.parentElement.parentElement.classList.remove("maximized");
            }
            refreshTasks();
          });
          break;
        case "X":
          button.addEventListener("click", (event) => {
            let button = event.currentTarget;
            button.parentElement.parentElement.style.display = "none";
            button.parentElement.parentElement.setAttribute("status", "closed");
            if (
              button.parentElement.parentElement.classList.contains("maximized")
            ) {
              button.parentElement.parentElement.classList.remove("maximized");
            }
            refreshTasks();
          });
          break;
        default:
      }

      container.appendChild(button);
    }

    element.prepend(container);
  });
}

addWindowControls();
