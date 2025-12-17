export { taskbarTime };

function taskbarTime() {
  const taskbar = document.querySelector("taskbar");
  const div = taskbar.querySelector(".time");

  let timeFormat = "12"; // Default to 12-hour format
  let ampm = "am";

  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    if (timeFormat === "12") {
      ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert to 12-hour format
      div.textContent = `${hours}:${minutes} ${ampm}`;
    } else {
      div.textContent = `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

  setInterval(updateTime, 1000);

  updateTime();

  div.addEventListener("click", () => {
    timeFormat = timeFormat === "12" ? "24" : "12";
    updateTime();
  });
}

taskbarTime();
