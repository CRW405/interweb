export { addWindowTitles };

function addWindowTitles() {
  let windows = document.querySelectorAll("window");

  windows.forEach((element) => {
    let name = element.getAttribute("name") || "empty";

    let titleContainer = document.createElement("window-title");
    titleContainer.textContent = name;
    if (name === "empty") {
      titleContainer.style.color = "transparent";
    }
    element.prepend(titleContainer);
  });
}

addWindowTitles();
