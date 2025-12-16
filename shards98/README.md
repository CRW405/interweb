# shards98

CSS and JS style library inspired by [98.css](https://jdan.github.io/98.css)

## Installation

### Via npm

```bash
npm install shards98
```

Then import in your project:

```javascript
import "shards98/shards98.css";
import { addWindowControls, addWindowTitles, populateTaskBar } from "shards98";
```

### Via CDN (no installation required)

Include directly in your HTML:

```html
<!-- CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/shards98@1.0.0/shards98.css"
/>

<!-- JavaScript -->
<script type="module">
  import {
    addWindowControls,
    addWindowTitles,
    populateTaskBar,
  } from "https://cdn.jsdelivr.net/npm/shards98@1.0.0/js/index.js";

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

## Usage

```javascript
// Add window controls (minimize, maximize, close buttons)
addWindowControls();

// Add window titles
addWindowTitles();

// Populate taskbar
populateTaskBar();
```

```HTML
<!-- how to make a window -->
<window status="{opened|minimized|maximized}" name="{name goes here}">
  <!-- Whatever you want goes here -->
</window>

<!-- How to make the taskbar -->
<taskbar>
  <img src="{your icon goes here}" alt="{alt goes here}" class="icon" />

  <div class="start-menu">
    <h2>Start</h2>
    <ul class="start-list">
      <!-- closed windows go here -->
    </ul>
  </div>

  <ul class="tasks">
    <!-- Minimized or opened windows go here -->
  </ul>

  <div class="time">12:00 PM</div>
</taskbar>
```
