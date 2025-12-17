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
              windowElement.setAttribute("status", "opened");
              windowElement.classList.remove("maximized");
            } else {
              windowElement.setAttribute("status", "maximized");
              windowElement.classList.add("maximized");
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
