const decorations = ["◻", "_", "X"]

let elements = document.querySelectorAll(".window");

elements.forEach(element => {
    let container = document.createElement("div")
    container.className = "control-container"

    for (const decoration of decorations) {
        let button = document.createElement("button")
        button.className = "window-button"
        button.textContent = decoration

        switch (decoration) {
            case "◻":
                break
            case "_":
                break
            case "X":
                button.addEventListener("click", (event) => {
                    let button = event.currentTarget
                    button.parentElement.parentElement.remove()
                    // this.parentElement.parentElement.remove()
                })
                break
                default:
        }

        container.appendChild(button)
    }

    element.prepend(container)
})
