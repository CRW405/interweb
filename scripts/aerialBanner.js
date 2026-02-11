const aerialBanner = document.querySelector("aerial-banner");
const bannerList = aerialBanner.querySelector("ul");

const blinksPath = "../medias/blinks/";

const blinks = `
aimlink.gif                  
antinft.gif                  
anydamnbrowser.gif           
bestused.png                 
bestview.gif                 
bestviewed.gif               
debian.gif                   
dontfeedai.gif               
eos.gif                      
getacomputer.jpg             
iexplorer.gif                
isurvived.gif                
mouse.gif                    
neko scape.gif             
neocities.png                
neocities_vaporwave_stamp.png
neovim.gif                   
nogpt.gif                    
piracy2.gif                  
saynotoweb3.gif              
yeehaw.gif                   
`;

const blinksList = blinks
  .split("\n")
  .filter(Boolean)
  .map((item) => item.trim());

for (const blink in blinksList) {
  let filePath = blinksPath + blinksList[blink];
  let li = document.createElement("li");
  let img = document.createElement("img");
  img.classList.add("blink");

  img.src = filePath;
  img.alt = blink;

  bannerList.appendChild(li);
  li.appendChild(img);
}

// Clone all items for seamless infinite scroll
const allItems = bannerList.querySelectorAll("li");
allItems.forEach((item) => {
  const clone = item.cloneNode(true);
  bannerList.appendChild(clone);
});

// Infinite scroll animation
let scrollPosition = 0;
const scrollSpeed = 1; // pixels per frame (adjust for faster/slower)

function animate() {
  scrollPosition += scrollSpeed;

  // Get the width of half the list (original items)
  const listWidth = bannerList.scrollWidth / 2;

  // Reset position when we've scrolled past the first set
  if (scrollPosition >= listWidth) {
    scrollPosition = 0;
  }

  // Apply the transform
  bannerList.style.transform = `translateX(-${scrollPosition}px)`;

  // Continue animation
  requestAnimationFrame(animate);
}

// Start the animation
animate();
