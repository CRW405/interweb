import { refreshTasks } from "./populateTaskBar.js";

// const decorations = ["◻", "_", "X"]
const decorations = ["_", "X"];

let elements = document.querySelectorAll("window");

elements.forEach((element) => {
  let container = document.createElement("window-controls");

  for (const decoration of decorations) {
    let button = document.createElement("button");
    button.textContent = decoration;

    switch (decoration) {
      case "◻":
        // TODO: make this do something
        // I'll do it one day, maybe just make width and heigh 100%, idk
        break;
      case "_":
        button.addEventListener("click", (event) => {
          let button = event.currentTarget;
          button.parentElement.parentElement.style.display = "none";
          button.parentElement.parentElement.setAttribute(
            "status",
            "minimized",
          );
          refreshTasks();
        });
        break;
      case "X":
        button.addEventListener("click", (event) => {
          let button = event.currentTarget;
          button.parentElement.parentElement.style.display = "none";
          button.parentElement.parentElement.setAttribute("status", "closed");
          refreshTasks();
        });
        break;
      default:
    }

    container.appendChild(button);
  }

  element.prepend(container);
});
