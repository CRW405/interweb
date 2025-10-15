const windowList = document.getElementById("window-list")
const ul = windowList.firstElementChild

let windows = document.querySelectorAll(".window")

for (const window of windows) {
    let li = document.createElement("li")
    let button = document.createElement("button")

    let titleContainer = window.querySelector(".window-title")
    let title = titleContainer ? titleContainer.textContent.trim() : (window.id || window.tagName.toLowerCase())
    // console.log(title);

    button.textContent = title;

    button.addEventListener("click", () => {
        if (window.style.display === "block") {
            window.style.display = "none";
        } else {
            window.style.display = "block";
        }
    })

    li.appendChild(button)
    ul.appendChild(li)
    
}