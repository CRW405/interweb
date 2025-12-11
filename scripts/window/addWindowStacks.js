/*
    class syntax:
        `.window-stack-{left/right}-{count}-{offset}`
        eg.
        `.window-stack-left-5-10`
        `.window-stack-right-10-5`

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
        .filter(element => /window-stack-(?:left|right|top|bottom|topleft|topright|bottomleft|bottomright)-\d+-\d+/.test(element.className));

    for (const win of windows) {
        let input = win.className.match(/window-stack-(left|right|top|bottom|topleft|topright|bottomleft|bottomright)-(\d+)-(\d+)/)
        let direction = input[1]
        let number = parseInt(input[2])
        let offset = parseInt(input[3])

        let stackers = []

        for (let i = 1; i < number+1; i++) {
            let x
            let y

            switch (direction) {
                case ("topleft"):
                    x = i * offset
                    y = -i * offset
                    break
                case ("top"):
                    x = 0
                    y = -i * offset
                    break
                case ("topright"):
                    x = i * offset
                    y = -i * offset
                    break
                case ("right"):
                    x = i * offset
                    y = 0
                    break
                case ("bottomright"):
                    x = i * offset
                    y = i * offset
                    break
                case ("bottom"):
                    x = 0
                    y = i * offset
                    break
                case ("bottomleft"):
                    x = -i * offset
                    y = i * offset
                    break
                case ("left"):
                    x = -i * offset
                    y = 0
                    break
                default:
                    break
            }
            stackers.push(x+"px" + " " + y+"px" + " 0 lightblue")
        }
        win.style.boxShadow = stackers.join(", ")
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