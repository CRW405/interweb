# shards98

CSS and JS style library inspired by [98.css](https://jdan.github.io/98.css)

## Installation
### Via CDN (no installation required, recommended)

Include directly in your HTML:

```html
<!-- CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/shards98@1.0.8/shards98.css"
/>

<!-- JavaScript -->
<script type="module">
  import {
    addWindowControls,
    addWindowTitles,
    populateTaskBar,
  } from "https://cdn.jsdelivr.net/npm/shards98@1.0.8/js/index.js";

  // Your code here
</script>
```

**Alternative CDN (unpkg):**

```html
<link rel="stylesheet" href="https://unpkg.com/shards98@1.0.0/shards98.css" />
<script
  type="module"
  src="https://unpkg.com/shards98@1.0.0/js/index.js"
></script>
```

### Via npm

I don't recommend this but you can do it if you want

```bash
npm install shards98
```

Then import in your project:

```javascript
import "shards98/shards98.css";
import { addWindowControls, addWindowTitles, populateTaskBar } from "shards98";
```
## Usage

Until I change it, the taskbar is required

Add this to your html:
```HTML
<!-- how to make a window -->
<window status="{opened|closed|minimized|maximized}" name="{name goes here}">
  <!-- Content inside of the body of the window. Full HTML works here -->
</window>

<!-- How to make the taskbar -->
<taskbar>
  <img src="./link/to/icon/file" alt="description of icon" class="icon" />

  <div class="start-menu">
    <h2>Start</h2>
    <ul class="start-list">
      <!-- populated via js. <window> tags with the status of "closed" will appear here but nowhere else until launched. -->
    </ul>
  </div>

  <ul class="tasks">
    <!-- populated via js -->
  </ul>

<!-- time will update via js -->
  <div class="time">12:00 PM</div>
</taskbar>
```

## Styling
Most of the style will come in using the CDN import. Add additional using the template below:

```CSS
taskbar .start-menu {
  /* set your start menu's background here */
}

window-title {
  /* for custom window titles*/
}

window-controls {
  /* for custom window controls */
}
window-controls button {
  /* for custom window control buttons */
}
```
