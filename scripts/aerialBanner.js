import blinks from "./blinks.js";

const aerialBanner = document.querySelector("aerial-banner");
const bannerList = aerialBanner.querySelector("ul");

const blinksPath = "../medias/blinks/";

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const blinksList = shuffle([...blinks]);

for (const blink of blinksList) {
	let filePath = blinksPath + blink;
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
