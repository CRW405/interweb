const windows = document.querySelectorAll(".window")
const names = Array.from(windows).map(element => element.id ? element.id : element.tagName.toLowerCase());

const capitalize = string => string ? string.charAt(0).toUpperCase() + string.slice(1) : string;
const capitalizedNames = names.map(capitalize);

const windowNamesString = capitalizedNames.join(", ");
window.windowNamesString = windowNamesString;
console.log(windowNamesString);

window.forEach((element, i) => {
    let title = capitalizedNames[i]

    let titleContainer = document.createElement("div")
    titleContainer.className = "window-title"
    element.prepend(titleContainer)
    titleContainer.textContent=title
});