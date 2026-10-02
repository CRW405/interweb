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

When using a taskbar, register a newly created window with it after appending
the element. Registration adds the window to the taskbar and refreshes its
tasks immediately:

```js
import { CreateWindow, initialize } from "./shards98/js/shards98.js";

const manager = initialize(document);
const dynamicWindow = CreateWindow("<p>Created at runtime.</p>");
dynamicWindow.setTitle("Dynamic window");
document.querySelector("main").append(dynamicWindow.element);
manager.taskbar?.register(dynamicWindow);
```

Calling `register()` again for the same window is safe; it does not create a
duplicate task.

Dynamic windows can also be created in response to user actions. Keep the
returned window instance when the application needs to update or control it
later:

```html
<button id="close-about" type="button">Close the About window</button>
```

```js
const openWindow = (title, message) => {
  const dynamicWindow = CreateWindow(
    `<h2>${title}</h2><p>${message}</p>`,
    { resizable: false },
  );

  dynamicWindow
    .setTitle(title)
    .setOption("draggable", true)
    .open();
  document.querySelector("main").append(dynamicWindow.element);
  return dynamicWindow;
};

const about = openWindow("About", "This window was created on demand.");
document.querySelector("#close-about").addEventListener("click", () => {
  about.close();
});
```

For content that includes user-provided values, create the content with DOM
methods instead of interpolating it into an HTML string:

```js
const dynamicWindow = CreateWindow("", { controls: false });
const heading = document.createElement("h2");
heading.textContent = "Safe dynamic content";
dynamicWindow.content.append(heading);
document.querySelector("main").append(dynamicWindow.element);
```

`window.content` is the window's `.window-content` element, so you can use it
to read or replace content without querying the generated markup:

```js
dynamicWindow.content.innerHTML = "<p>Updated content</p>";
```

## Styling

Load `shards98.css` first, then override the library styles in your
application stylesheet. Windows accept normal classes and inline styles:

```html
<window class="help-window" name="Help">
  <h2>Keyboard shortcuts</h2>
  <p>Drag the title bar to move this window.</p>
</window>
```

```css
:root {
  --shards98-titlebar-height: 2rem;
  --shards98-taskbar-height: 2.25rem;
}

window.help-window {
  width: min(32rem, 100%);
  padding: 1rem;
  border: 2px solid #173b63;
  background: #e8f1ff;
  color: #173b63;
}

window.help-window > window-title {
  padding: 0 0.5rem;
  background: #173b63;
  color: white;
  line-height: var(--shards98-titlebar-height);
}

window.help-window .window-content {
  padding: 0.5rem;
}
```

The same classes and styles work for windows created with `CreateWindow`:

```js
const settings = CreateWindow("<p>Choose your preferences.</p>");
settings.element.classList.add("settings-window");
settings.element.style.setProperty("width", "24rem");
document.querySelector("main").append(settings.element);
```

Use `window.maximized` and the `status` attribute to style state-specific
appearances, for example `window[status="minimized"]` or
`window.maximized .window-content`.

## Manual initialization

Automatic initialization can be supplemented or replaced in an application
that controls when its markup is ready:

```js
import { initialize } from "./shards98/js/shards98.js";

const manager = initialize(document, { resizable: false });
```

The manager exposes `windows`, `groups`, and the optional `taskbar`. The
taskbar exposes `register(window)` for adding dynamically created windows.
Individual windows expose a `content` element along with `open()`, `minimize()`,
`close()`, `toggleMaximize()`, `restore()`, `setTitle()`, and `setOption()`.

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
