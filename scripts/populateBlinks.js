let blinkList = document.getElementById("blink-list")
let path = "medias/blinks/"
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
  "yeehaw.gif",
  "debian.gif",
  "eos.gif",
  "neovim.gif",
  "piracy2.gif"
]

for (const blink of blinks) {
  let file = path + blink

  let li = document.createElement("li")
  let img = document.createElement("img")
  img.src = file
  li.appendChild(img)
  blinkList.appendChild(li)
}

// medias/blinks/aimlink.gif
