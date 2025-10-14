/*
    class syntax:
        `.window-stack-{left/right}-{count}-{offset}`
        eg.
        `.winow-stack-left-5-10`
        `.winow-stack-right-10-5`

    ref:
        .window-stack {
            --offset: 5px;
            --shadow-color: lightblue;
            box-shadow:
                calc(var(--offset) * -1) calc(var(--offset) * 1) 0 var(--shadow-color),
                calc(var(--offset) * -2) calc(var(--offset) * 2) 0 var(--shadow-color),
                calc(var(--offset) * -3) calc(var(--offset) * 3) 0 var(--shadow-color),
                calc(var(--offset) * -4) calc(var(--offset) * 4) 0 var(--shadow-color),
                calc(var(--offset) * -5) calc(var(--offset) * 5) 0 var(--shadow-color),
                calc(var(--offset) * -6) calc(var(--offset) * 6) 0 var(--shadow-color),
                calc(var(--offset) * -7) calc(var(--offset) * 7) 0 var(--shadow-color),
                calc(var(--offset) * -8) calc(var(--offset) * 8) 0 var(--shadow-color)
        }
*/
(function () {
    let windows = Array.from(document.querySelectorAll('[class*="window-stack-"]'))
        .filter(element => /window-stack-(?:left|right)-\d+-\d+/.test(element.className));

    for (const window of windows) {
        let input = window.className.match(/window-stack-(left|right)-(\d+)-(\d+)/)
        let direction = input[1]
        let number = parseInt(input[2])
        let offset = parseInt(input[3])



    }        
})()

/* OLD
let windowRect = window.getBoundingClientRect()
        let windowWidth = windowRect.width
        let windowHeight = window.offsetWidth

        for (let i = 2; i < number+2; i++) {
            let stacker = document.createElement("div")            
            stacker.className = "window-no-controls"
            stacker.style.width = windowWidth + "px"
            stacker.style.height = windowHeight + "px"
            stacker.style.position = "absolute"
            stacker.style.zIndex = 0-i

            let position = offset * i - 55

            switch (direction) {
                case "right":
                    stacker.style.left = (position) + "px"
                    break
                case "left":
                    stacker.style.right = (position) + "px"
                    break
                default:
                    break
            }
            stacker.style.top = (position) + "px"

            window.appendChild(stacker)
        }
        
    }
*/