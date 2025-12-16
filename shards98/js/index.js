import { refreshTasks } from "./populateTaskBar.js";
import "./addWindowTitles.js";
import "./addWindowControls.js";
import "./taskbarTime.js";

// Export public API
export function init() {
  refreshTasks();
  console.log("Shards98 initialized!");
}

// Auto-initialize if desired
if (typeof window !== "undefined") {
  window.Shards98 = { init, refreshTasks };
}
