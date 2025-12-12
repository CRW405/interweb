const taskBar = document.querySelector("taskbar");
const list = taskBar.querySelector("ul");

let allWindows = document.querySelectorAll("window");

for (const window of allWindows) {
  let li = document.createElement("li");
  let name = window.getAttribute("name");
  let id = window.getAttribute("id");

  li.textContent = name;

  li.addEventListener("click", () => {
    if (getComputedStyle(window).display == "block") {
      window.style.display = "none";
    } else {
      window.style.display = "block";
    }
  });

  list.appendChild(li);
}

