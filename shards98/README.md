# shards98

CSS and JavaScript window controls inspired by Windows 98.

## Installation

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/shards98@1.1.0/shards98.css"
/>
<script type="module" src="./shards98/js/shards98.js"></script>
```

The module automatically enhances existing `window`, `window-group`, and
`taskbar` elements. A taskbar is optional.

## Windows

```html
<window status="opened" name="Welcome">
  <h1>Hello</h1>
</window>
```

Windows can be dragged from their title bar and resized from any edge or
corner. Dragging a grouped window out of its group preserves the group’s
layout; the dock control returns it to its original group position and size.
The default controls support minimizing, maximizing, restoring, and closing.

## Creating windows

`CreateWindow` creates and enhances a window without inserting it into the
document. This lets the caller choose its parent:

```js
import { CreateWindow } from "./shards98/js/shards98.js";

const welcome = CreateWindow("<h1>Hello</h1>", {
  draggable: true,
  resizable: true,
});
welcome.setTitle("Dynamic window");
document.querySelector("main").append(welcome.element);
```

Available window options are `draggable`, `resizable`, `controls`, `title`,
`minimize`, `maximize`, and `close`.

## Manual initialization

Automatic initialization can be supplemented or replaced in an application
that controls when its markup is ready:

```js
import { initialize } from "./shards98/js/shards98.js";

const manager = initialize(document, { resizable: false });
```

The manager exposes `windows`, `groups`, and the optional `taskbar`. Individual
windows expose `open()`, `minimize()`, `close()`, `toggleMaximize()`,
`restore()`, `setTitle()`, and `setOption()`.

## Source layout

The JavaScript entrypoint is `js/shards98.js`. Its implementation is split into
`window.js`, `taskbar.js`, `groups.js`, `manager.js`, and `config.js`, so each
part of the library can be maintained independently while consumers keep
using the single entrypoint.

## Taskbar markup

```html
<taskbar>
  <button class="icon" type="button" aria-label="Start"></button>
  <div class="start-menu" hidden>
    <h2>Start</h2>
    <ul class="start-list"></ul>
  </div>
  <ul class="tasks"></ul>
  <div class="time"></div>
</taskbar>
```
