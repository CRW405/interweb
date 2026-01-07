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
chrmevil.gif                 
debian.gif                   
dontfeedai.gif               
eos.gif                      
fuckadobe.gif                
getacomputer.jpg             
iexplorer.gif                
isurvived.gif                
jesus.gif                    
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
