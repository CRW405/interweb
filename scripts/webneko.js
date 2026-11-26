// I didnt like WebNeko handles its coordinates and overlay so I fixed it

window.addEventListener("load", () => {
	const neko = window.aNekos?.[0];
	const box = window.box;
	if (!neko || !box) return;

	let pointerX = 0;
	let pointerY = 0;
	let previousScrollX = 0;
	let previousScrollY = 0;

	window.addEventListener(
		"mousemove",
		(event) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
		},
		{ passive: true },
	);

	neko.TargetMouse = function () {
		this.endx = window.scrollX + box.boundWidth(pointerX + 4);
		this.endy = window.scrollY + box.boundHeight(pointerY - 20);
		box.setBoard(this.whichNeko, this.endx, this.endy);
	};

	const keepNekoInViewport = () => {
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		const deltaX = scrollX - previousScrollX;
		const deltaY = scrollY - previousScrollY;

		neko.homeX = scrollX;
		neko.homeY = scrollY;
		neko.layer.myx += deltaX;
		neko.layer.myy += deltaY;

		neko.layer.style.left = `${neko.layer.myx}px`;
		neko.layer.style.top = `${neko.layer.myy}px`;
		previousScrollX = scrollX;
		previousScrollY = scrollY;
	};

	keepNekoInViewport();
	window.addEventListener("scroll", keepNekoInViewport, { passive: true });
});
