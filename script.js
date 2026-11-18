(() => {
  "use strict";

  const STORAGE_KEY = "daymark.tasks.v1";
  const form = document.querySelector("#task-form");
  const input = document.querySelector("#task-input");
  const descriptionInput = document.querySelector("#task-description");
  const categoryInput = document.querySelector("#task-category");
  const dueDateInput = document.querySelector("#task-due-date");
  const priorityInput = document.querySelector("#task-priority");
  const list = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const taskCount = document.querySelector("#task-count");
  const remainingCopy = document.querySelector("#remaining-copy");
  const clearCompleted = document.querySelector("#clear-completed");
  const liveRegion = document.querySelector("#live-region");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let filter = "all";

  function dateFromToday(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function sampleTasks() {
    return [
      {
        id: "sample-todo-submission",
        text: "Polish the To-Do App submission",
        description: "Review task creation, filters, due dates, and priorities. Check the README, then upload the final project files.",
        category: "Internship",
        dueDate: dateFromToday(1),
        priority: "high",
        completed: false
      },
      {
        id: "sample-data-structures",
        text: "Revise trees and traversal methods",
        description: "Review preorder, inorder, and postorder traversal, solve three practice questions, and note any mistakes to revisit.",
        category: "Studies",
        dueDate: dateFromToday(2),
        priority: "medium",
        completed: false
      },
      {
        id: "sample-lecture-notes",
        text: "Organize this week’s lecture notes",
        description: "Sort notes by subject, add headings for each topic, and write down two questions to ask in the next class.",
        category: "Studies",
        dueDate: dateFromToday(4),
        priority: "low",
        completed: false
      },
      {
        id: "sample-progress-update",
        text: "Prepare an internship progress update",
        description: "List completed work, mention any blockers, and outline the next steps before sending the update.",
        category: "Internship",
        dueDate: dateFromToday(5),
        priority: "medium",
        completed: false
      },
      {
        id: "sample-study-plan",
        text: "Plan next week’s study sessions",
        description: "Choose three learning goals, reserve focused study blocks in the calendar, and leave time for breaks.",
        category: "Planning",
        dueDate: dateFromToday(7),
        priority: "low",
        completed: true
      }
    ];
  }

  function normalizeTask(task) {
    if (!task || typeof task.id !== "string" || typeof task.text !== "string" || typeof task.completed !== "boolean") return null;
    return {
      ...task,
      description: typeof task.description === "string" ? task.description : "",
      category: typeof task.category === "string" ? task.category : "",
      dueDate: typeof task.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? task.dueDate : "",
      priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium"
    };
  }

  function readTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return { tasks: sampleTasks(), firstRun: true };
      const saved = JSON.parse(stored);
      return { tasks: Array.isArray(saved) ? saved.map(normalizeTask).filter(Boolean) : [], firstRun: false };
    } catch {
      return { tasks: [], firstRun: false };
    }
  }

  const loaded = readTasks();
  let tasks = loaded.tasks;

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      liveRegion.textContent = "Your browser could not save changes. Check your storage settings.";
    }
  }

  function icon(name) {
    if (name === "check") return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8.2 3 3 6-6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 4.5h9m-7.8 0 .5 8h5.6l.5-8M6.5 4.5V3h3v1.5m-2.5 2v3.8m2-3.8v3.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function formatDueDate(value, completed) {
    if (!value) return "";
    const due = new Date(`${value}T00:00:00`);
    if (Number.isNaN(due.getTime())) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isOverdue = due.getTime() < today.getTime() && !completed;
    const label = isOverdue
      ? `Overdue · ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due)}`
      : due.getTime() === today.getTime()
        ? "Due today"
        : due.getTime() === tomorrow.getTime()
          ? "Due tomorrow"
          : `Due ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due)}`;
    return { label, overdue: isOverdue };
  }

  function render() {
    const remaining = tasks.filter((task) => !task.completed).length;
    const completed = tasks.length - remaining;
    const visible = tasks.filter((task) => filter === "all" || (filter === "active" ? !task.completed : task.completed));
    list.replaceChildren();

    visible.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " is-complete" : ""}`;

      const toggle = document.createElement("button");
      toggle.className = "complete-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", task.completed ? `Mark “${task.text}” as active` : `Mark “${task.text}” as completed`);
      toggle.setAttribute("aria-pressed", String(task.completed));
      toggle.innerHTML = icon("check");
      toggle.addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks();
        render();
        liveRegion.textContent = task.completed ? "Task marked completed." : "Task marked active.";
      });

      const content = document.createElement("div");
      content.className = "task-content";

      const titleRow = document.createElement("div");
      titleRow.className = "task-title-row";
      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;
      titleRow.append(text);

      const priority = document.createElement("span");
      priority.className = `priority-tag priority-${task.priority}`;
      priority.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
      titleRow.append(priority);
      content.append(titleRow);

      if (task.description) {
        const description = document.createElement("p");
        description.className = "task-description";
        description.textContent = task.description;
        content.append(description);
      }

      const metadata = document.createElement("div");
      metadata.className = "task-metadata";
      if (task.category) {
        const category = document.createElement("span");
        category.className = "category-tag";
        category.textContent = task.category;
        metadata.append(category);
      }
      const dueDate = formatDueDate(task.dueDate, task.completed);
      if (dueDate) {
        const due = document.createElement("span");
        due.className = `due-tag${dueDate.overdue && !task.completed ? " is-overdue" : ""}`;
        due.textContent = dueDate.label;
        metadata.append(due);
      }
      if (metadata.childElementCount > 0) content.append(metadata);

      const remove = document.createElement("button");
      remove.className = "delete-button";
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove “${task.text}”`);
      remove.innerHTML = icon("delete");
      remove.addEventListener("click", () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveTasks();
        render();
        liveRegion.textContent = "Task removed.";
      });

      item.append(toggle, content, remove);
      list.append(item);
    });

    taskCount.textContent = String(tasks.length);
    remainingCopy.textContent = tasks.length === 0 ? "Nothing on your list yet" : remaining === 0 ? "Everything is complete — nice work!" : `${remaining} ${remaining === 1 ? "task" : "tasks"} left to do`;
    clearCompleted.hidden = completed === 0;
    emptyState.classList.toggle("is-visible", visible.length === 0);
    emptyState.querySelector(".empty-title").textContent = tasks.length === 0 ? "A clear page." : filter === "active" ? "All caught up." : "Nothing here yet.";
    emptyState.querySelector(".empty-copy").textContent = tasks.length === 0 ? "Add a task above and get your day moving." : filter === "active" ? "No active tasks. Enjoy the breathing room." : "Try another filter to find your tasks.";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    tasks.unshift({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      description: descriptionInput.value.trim(),
      category: categoryInput.value.trim(),
      dueDate: dueDateInput.value,
      priority: priorityInput.value,
      completed: false
    });
    saveTasks();
    filter = "all";
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    input.value = "";
    descriptionInput.value = "";
    categoryInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    render();
    input.focus();
    liveRegion.textContent = "Task added.";
  });

  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((entry) => {
      const active = entry === button;
      entry.classList.toggle("is-active", active);
      entry.setAttribute("aria-pressed", String(active));
    });
    render();
  }));

  clearCompleted.addEventListener("click", () => {
    const count = tasks.filter((task) => task.completed).length;
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
    liveRegion.textContent = `${count} completed ${count === 1 ? "task" : "tasks"} cleared.`;
  });

  if (loaded.firstRun) saveTasks();
  render();
})();

