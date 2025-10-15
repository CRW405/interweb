let blinkList = document.getElementById("blink-list")
let path = new URL("/medias/blinks/", document.baseURI)
let blinks = [
    "aimlink.gif",
    "bestused.png",
    "bestview.gif",
    "chrmevil.gif",
    "dontfeedai.gif",
    "fuckadobe.gif",
    "iexplorer.gif",
    "isurvived.gif",
    "jesus.gif",
    "neocities.png",
    "saynotoweb3.gif",
    "yeehaw.gif"
]

for (const blink of blinks) {
    let file = new URL(blink, path).href
    let li = document.createElement("li")
    let img = document.createElement("img")
    img.src = file
    img.alt = blink
    li.appendChild(img)
    blinkList.appendChild(li)
}