(() => {
  "use strict";
  const STORAGE_KEY = "daymark.tasks.v1";
  const form = document.querySelector("#task-form");
  const input = document.querySelector("#task-input");
  const list = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const taskCount = document.querySelector("#task-count");
  const remainingCopy = document.querySelector("#remaining-copy");
  const clearCompleted = document.querySelector("#clear-completed");
  const liveRegion = document.querySelector("#live-region");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let filter = "all";

  function readTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((task) => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean") : [];
    } catch { return []; }
  }
  let tasks = readTasks();
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { liveRegion.textContent = "Your browser could not save changes. Check your storage settings."; }
  }
  function icon(name) {
    if (name === "check") return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8.2 3 3 6-6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 4.5h9m-7.8 0 .5 8h5.6l.5-8M6.5 4.5V3h3v1.5m-2.5 2v3.8m2-3.8v3.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function render() {
    const remaining = tasks.filter((task) => !task.completed).length;
    const completed = tasks.length - remaining;
    const visible = tasks.filter((task) => filter === "all" || (filter === "active" ? !task.completed : task.completed));
    list.replaceChildren();
    visible.forEach((task) => {
      const item = document.createElement("li");
      item.className = "task-item" + (task.completed ? " is-complete" : "");
      const toggle = document.createElement("button");
      toggle.className = "complete-toggle"; toggle.type = "button";
      toggle.setAttribute("aria-label", task.completed ? "Mark “" + task.text + "” as active" : "Mark “" + task.text + "” as completed");
      toggle.setAttribute("aria-pressed", String(task.completed)); toggle.innerHTML = icon("check");
      toggle.addEventListener("click", () => { task.completed = !task.completed; saveTasks(); render(); liveRegion.textContent = task.completed ? "Task marked completed." : "Task marked active."; });
      const text = document.createElement("span"); text.className = "task-text"; text.textContent = task.text;
      const remove = document.createElement("button"); remove.className = "delete-button"; remove.type = "button";
      remove.setAttribute("aria-label", "Remove “" + task.text + "”"); remove.innerHTML = icon("delete");
      remove.addEventListener("click", () => { tasks = tasks.filter((entry) => entry.id !== task.id); saveTasks(); render(); liveRegion.textContent = "Task removed."; });
      item.append(toggle, text, remove); list.append(item);
    });
    taskCount.textContent = String(tasks.length);
    remainingCopy.textContent = tasks.length === 0 ? "Nothing on your list yet" : remaining === 0 ? "Everything is complete — nice work!" : remaining + " " + (remaining === 1 ? "task" : "tasks") + " left to do";
    clearCompleted.hidden = completed === 0;
    emptyState.classList.toggle("is-visible", visible.length === 0);
    emptyState.querySelector(".empty-title").textContent = tasks.length === 0 ? "A clear page." : filter === "active" ? "All caught up." : "Nothing here yet.";
    emptyState.querySelector(".empty-copy").textContent = tasks.length === 0 ? "Add a task above and get your day moving." : filter === "active" ? "No active tasks. Enjoy the breathing room." : "Try another filter to find your tasks.";
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault(); const text = input.value.trim();
    if (!text) { input.focus(); return; }
    tasks.unshift({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()) + "-" + Math.random().toString(36).slice(2), text, completed: false });
    saveTasks(); filter = "all";
    filterButtons.forEach((button) => { const active = button.dataset.filter === filter; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
    input.value = ""; render(); input.focus(); liveRegion.textContent = "Task added.";
  });
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((entry) => { const active = entry === button; entry.classList.toggle("is-active", active); entry.setAttribute("aria-pressed", String(active)); });
    render();
  }));
  clearCompleted.addEventListener("click", () => {
    const count = tasks.filter((task) => task.completed).length;
    tasks = tasks.filter((task) => !task.completed); saveTasks(); render();
    liveRegion.textContent = count + " completed " + (count === 1 ? "task" : "tasks") + " cleared.";
  });
  render();
})();
