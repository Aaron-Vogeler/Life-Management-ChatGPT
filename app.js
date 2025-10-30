const STORAGE_KEY = "flowframe-state-v1";
const defaultPalette = {
  background: "#f5efe6",
  surface: "#fffaf2",
  accent: "#c9a976",
  text: "#2f241d",
};

const moduleDefinitions = {
  projects: {
    name: "Projects",
    icon: "🧭",
    description:
      "Track multi-step journeys with status, progress and upcoming deadlines.",
    supportsRelationships: true,
    defaultData: () => ({
      items: [
        {
          id: createId(),
          title: "Craft onboarding",
          status: "In progress",
          owner: "Design",
          progress: 64,
          due: "2024-09-06",
          note: "Build tailored welcome experience for new members.",
        },
        {
          id: createId(),
          title: "Automation rituals",
          status: "Planning",
          owner: "Ops",
          progress: 32,
          due: "2024-09-18",
          note: "Outline weekly maintenance loops and automations.",
        },
      ],
    }),
    getItems(module) {
      return Array.isArray(module.data.items) ? module.data.items : [];
    },
    getItemTitle(item) {
      return item.title || "Untitled project";
    },
    getItemSubtitle(item) {
      const parts = [item.status, item.owner, item.due ? `Due ${formatDate(item.due)}` : ""].filter(
        Boolean,
      );
      return parts.join(" • ");
    },
    render({ module, container }) {
      const def = moduleDefinitions[module.type];
      const list = createEl("div", "list");
      const items = this.getItems(module);

      items.forEach((item, index) => {
        const entity = describeEntity(module, item);
        const entry = createEl("div", "list-item");
        entry.dataset.itemId = item.id;
        entry.dataset.ghostLabel = `${def.icon} ${entity.label}`;

        const title = createEl("div", "list-item__title");
        title.innerHTML = `<span>${escapeHtml(entity.label)}</span>`;
        if (item.status) {
          const status = createEl("span", "badge");
          status.textContent = item.status;
          title.appendChild(status);
        }

        const meta = createEl("div", "list-item__meta");
        meta.style.display = "flex";
        meta.style.justifyContent = "space-between";
        meta.style.gap = "0.5rem";
        meta.style.fontSize = "0.85rem";
        meta.style.color = "var(--text-muted)";
        const ownerText = item.owner ? escapeHtml(item.owner) : "Unassigned";
        meta.innerHTML = `<span>${ownerText}</span><span>${item.due ? `Due ${escapeHtml(
          formatDate(item.due),
        )}` : "No due"}</span>`;

        const note = createEl("p");
        note.textContent = item.note || "";
        note.style.margin = "0";
        note.style.color = "var(--text-muted)";
        note.style.fontSize = "0.88rem";

        const progress = createEl("div", "progress");
        const bar = createEl("span");
        bar.style.width = `${Math.min(Math.max(item.progress ?? 0, 0), 100)}%`;
        progress.append(bar);

        const actions = createEl("div");
        actions.style.display = "flex";
        actions.style.gap = "0.5rem";
        actions.style.marginTop = "0.6rem";

        const editBtn = createIconButton("Edit", "✏️");
        editBtn.addEventListener("click", () => openProjectEditor(module.id, index));

        const removeBtn = createIconButton("Remove", "✕");
        removeBtn.addEventListener("click", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items.splice(index, 1);
          });
        });

        actions.append(editBtn, removeBtn);

        entry.append(title, meta, progress, note, actions, createRelationshipsBlock(entity));
        list.append(entry);
      });

      if (!items.length) {
        const empty = createEl("div", "empty");
        empty.innerHTML = `
          <h3>No projects yet</h3>
          <p>Capture an initiative to start tracking milestones.</p>
        `;
        list.append(empty);
      } else {
        enableItemReorder(list, module, (draft) => draft.data.items);
      }

      const form = createEl("form", "inline-form");
      form.innerHTML = `
        <div class="form-row">
          <label>Project name</label>
          <input type="text" name="title" placeholder="Design retreat" required />
        </div>
        <div class="form-row horizontal">
          <div>
            <label>Status</label>
            <select name="status">
              <option>Planning</option>
              <option selected>In progress</option>
              <option>Blocked</option>
              <option>Complete</option>
            </select>
          </div>
          <div>
            <label>Owner</label>
            <input type="text" name="owner" placeholder="Team" />
          </div>
        </div>
        <div class="form-row horizontal">
          <div>
            <label>Progress</label>
            <input type="number" name="progress" min="0" max="100" step="5" value="20" />
          </div>
          <div>
            <label>Due</label>
            <input type="date" name="due" />
          </div>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea name="note" placeholder="Key outcomes, next steps or resources"></textarea>
        </div>
        <button type="submit">Add project</button>
      `;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = (formData.get("title") || "").toString().trim();
        if (!title) {
          return;
        }
        const newProject = {
          id: createId(),
          title,
          status: formData.get("status") || "Planning",
          owner: (formData.get("owner") || "").toString().trim(),
          progress: Number(formData.get("progress")) || 0,
          due: (formData.get("due") || new Date().toISOString().slice(0, 10)).toString(),
          note: (formData.get("note") || "").toString().trim(),
        };

        mutateModule(module.id, (draft) => {
          draft.data.items.push(newProject);
        });
        form.reset();
      });

      container.append(list, form);
    },
  },
  clients: {
    name: "Clients",
    icon: "🤝",
    description: "Keep track of the people and teams you collaborate with.",
    supportsRelationships: true,
    defaultData: () => ({
      items: [
        {
          id: createId(),
          name: "Aurora Studio",
          contact: "Lena Ortiz",
          focus: "Brand refresh",
          status: "Active",
          notes: "Weekly sync on Tuesdays.",
        },
        {
          id: createId(),
          name: "Summit Labs",
          contact: "Noah Reeves",
          focus: "Automation audit",
          status: "Prospect",
          notes: "Share pilot proposal next week.",
        },
      ],
    }),
    getItems(module) {
      return Array.isArray(module.data.items) ? module.data.items : [];
    },
    getItemTitle(item) {
      return item.name || "Unnamed client";
    },
    getItemSubtitle(item) {
      const focus = item.focus ? `Focus: ${item.focus}` : "";
      const contact = item.contact ? `Contact: ${item.contact}` : "";
      return [focus, contact].filter(Boolean).join(" • ");
    },
    render({ module, container }) {
      const def = moduleDefinitions[module.type];
      const list = createEl("div", "list");
      const items = this.getItems(module);

      items.forEach((item, index) => {
        const entity = describeEntity(module, item);
        const entry = createEl("div", "list-item");
        entry.dataset.itemId = item.id;
        entry.dataset.ghostLabel = `${def.icon} ${entity.label}`;

        const title = createEl("div", "list-item__title");
        title.innerHTML = `<span>${escapeHtml(entity.label)}</span>`;
        if (item.status) {
          const badge = createEl("span", "badge");
          badge.textContent = item.status;
          title.appendChild(badge);
        }

        const meta = createEl("div", "list-item__meta");
        meta.style.display = "flex";
        meta.style.flexWrap = "wrap";
        meta.style.gap = "0.5rem";
        meta.style.fontSize = "0.85rem";
        meta.style.color = "var(--text-muted)";
        if (item.contact) {
          const contact = createEl("span");
          contact.textContent = `Contact: ${item.contact}`;
          meta.append(contact);
        }
        if (item.focus) {
          const focus = createEl("span");
          focus.textContent = `Focus: ${item.focus}`;
          meta.append(focus);
        }

        const notes = createEl("p");
        notes.textContent = item.notes || "";
        notes.style.margin = "0";
        notes.style.color = "var(--text-muted)";
        notes.style.fontSize = "0.88rem";

        const actions = createEl("div");
        actions.style.display = "flex";
        actions.style.gap = "0.5rem";
        actions.style.marginTop = "0.6rem";

        const editBtn = createIconButton("Edit", "✏️");
        editBtn.addEventListener("click", () => openClientEditor(module.id, index));

        const removeBtn = createIconButton("Remove", "✕");
        removeBtn.addEventListener("click", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items.splice(index, 1);
          });
        });

        actions.append(editBtn, removeBtn);

        entry.append(title, meta, notes, actions, createRelationshipsBlock(entity));
        list.append(entry);
      });

      if (!items.length) {
        const empty = createEl("div", "empty");
        empty.innerHTML = `
          <h3>No clients tracked</h3>
          <p>Add a relationship to keep context close.</p>
        `;
        list.append(empty);
      } else {
        enableItemReorder(list, module, (draft) => draft.data.items);
      }

      const form = createEl("form", "inline-form");
      form.innerHTML = `
        <div class="form-row">
          <label>Client name</label>
          <input type="text" name="name" placeholder="Northwind Co." required />
        </div>
        <div class="form-row horizontal">
          <div>
            <label>Primary contact</label>
            <input type="text" name="contact" placeholder="Jordan" />
          </div>
          <div>
            <label>Status</label>
            <select name="status">
              <option selected>Active</option>
              <option>Prospect</option>
              <option>On hold</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label>Focus</label>
          <input type="text" name="focus" placeholder="Engagement goal" />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea name="notes" placeholder="Working cadences, preferences or context"></textarea>
        </div>
        <button type="submit">Add client</button>
      `;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = (formData.get("name") || "").toString().trim();
        if (!name) {
          return;
        }
        const client = {
          id: createId(),
          name,
          contact: (formData.get("contact") || "").toString().trim(),
          status: (formData.get("status") || "").toString().trim(),
          focus: (formData.get("focus") || "").toString().trim(),
          notes: (formData.get("notes") || "").toString().trim(),
        };

        mutateModule(module.id, (draft) => {
          draft.data.items.unshift(client);
        });
        form.reset();
      });

      container.append(list, form);
    },
  },
  tasks: {
    name: "Tasks",
    icon: "☑️",
    description: "Capture actionable steps and follow momentum across your day.",
    supportsRelationships: true,
    defaultData: () => ({
      items: [
        { id: createId(), title: "Morning plan review", done: true },
        { id: createId(), title: "Prototype weekly update", done: false },
        { id: createId(), title: "Share progress snapshot", done: false },
      ],
    }),
    getItems(module) {
      return Array.isArray(module.data.items) ? module.data.items : [];
    },
    getItemTitle(item) {
      return item.title || "Untitled task";
    },
    getItemSubtitle(item) {
      return item.done ? "Completed" : "In progress";
    },
    render({ module, container }) {
      const def = moduleDefinitions[module.type];
      const list = createEl("div", "task-list");
      const items = this.getItems(module);

      items.forEach((task, index) => {
        const entity = describeEntity(module, task);
        const wrapper = createEl("div", "task-wrapper");
        wrapper.dataset.itemId = task.id;
        wrapper.dataset.ghostLabel = `${def.icon} ${entity.label}`;

        const row = createEl("div", "task" + (task.done ? " done" : ""));
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!task.done;
        checkbox.addEventListener("change", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items[index].done = checkbox.checked;
          });
        });

        const title = createEl("span");
        title.textContent = task.title;
        title.style.flex = "1";

        const actions = createEl("div", "task__actions");
        const removeBtn = createIconButton("Remove", "✕");
        removeBtn.addEventListener("click", (event) => {
          event.preventDefault();
          mutateModule(module.id, (draft) => {
            draft.data.items.splice(index, 1);
          });
        });

        actions.append(removeBtn);
        row.append(checkbox, title, actions);
        wrapper.append(row, createRelationshipsBlock(entity, { variant: "inline" }));
        list.append(wrapper);
      });

      if (!items.length) {
        const empty = createEl("div", "empty");
        empty.innerHTML = `
          <h3>No tasks tracked</h3>
          <p>Add a focus task to keep the day intentional.</p>
        `;
        list.append(empty);
      } else {
        enableItemReorder(list, module, (draft) => draft.data.items);
      }

      const form = createEl("form", "inline-form");
      form.innerHTML = `
        <div class="form-row">
          <label>Quick add</label>
          <input type="text" name="title" placeholder="Outline launch email" required />
        </div>
        <button type="submit">Add task</button>
      `;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const titleField = form.querySelector("input[name=title]");
        const title = titleField.value.trim();
        if (!title) {
          return;
        }
        mutateModule(module.id, (draft) => {
          draft.data.items.push({ id: createId(), title, done: false });
        });
        form.reset();
        titleField.focus();
      });

      container.append(list, form);
    },
  },
  notes: {
    name: "Notes",
    icon: "📝",
    description: "Capture lightweight thoughts, meeting agendas or inspiration.",
    supportsRelationships: true,
    defaultData: () => ({
      items: [
        {
          id: createId(),
          title: "Framing",
          body: "Anchor decisions on the outcomes we want people to feel.",
        },
        {
          id: createId(),
          title: "Highlights",
          body: "Celebrate one micro-win daily to keep the team encouraged.",
        },
      ],
    }),
    getItems(module) {
      return Array.isArray(module.data.items) ? module.data.items : [];
    },
    getItemTitle(item) {
      return item.title || "Untitled note";
    },
    getItemSubtitle(item) {
      return item.body ? item.body.slice(0, 80) : "";
    },
    render({ module, container }) {
      const def = moduleDefinitions[module.type];
      const notes = createEl("div", "list");
      const items = this.getItems(module);

      items.forEach((note, index) => {
        const entity = describeEntity(module, note);
        const card = createEl("div", "note-card");
        card.dataset.itemId = note.id;
        card.dataset.ghostLabel = `${def.icon} ${entity.label}`;

        const titleField = createEl("input");
        titleField.type = "text";
        titleField.value = note.title;
        titleField.placeholder = "Untitled";
        titleField.addEventListener("input", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items[index].title = titleField.value;
          }, { silent: true });
        });

        const bodyField = document.createElement("textarea");
        bodyField.value = note.body;
        bodyField.placeholder = "Write freely…";
        bodyField.addEventListener("input", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items[index].body = bodyField.value;
          }, { silent: true });
        });

        const footer = createEl("div");
        footer.style.display = "flex";
        footer.style.justifyContent = "flex-end";
        footer.style.alignItems = "center";

        const removeBtn = createIconButton("Remove note", "✕");
        removeBtn.addEventListener("click", () => {
          mutateModule(module.id, (draft) => {
            draft.data.items.splice(index, 1);
          });
        });

        footer.append(removeBtn);

        card.append(titleField, bodyField, footer, createRelationshipsBlock(entity));
        notes.append(card);
      });

      if (!items.length) {
        const empty = createEl("div", "empty");
        empty.innerHTML = `
          <h3>No notes captured</h3>
          <p>Start a card to keep context next to your plans.</p>
        `;
        notes.append(empty);
      } else {
        enableItemReorder(notes, module, (draft) => draft.data.items);
      }

      const form = createEl("form", "inline-form");
      form.innerHTML = `
        <div class="form-row">
          <label>Note title</label>
          <input type="text" name="title" placeholder="Stand-up summary" required />
        </div>
        <div class="form-row">
          <label>Details</label>
          <textarea name="body" placeholder="Capture key takeaways or links"></textarea>
        </div>
        <button type="submit">Add note</button>
      `;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = (formData.get("title") || "").toString().trim();
        if (!title) {
          return;
        }
        mutateModule(module.id, (draft) => {
          draft.data.items.unshift({
            id: createId(),
            title,
            body: (formData.get("body") || "").toString().trim(),
          });
        });
        form.reset();
      });

      container.append(notes, form);
    },
  },
  journal: {
    name: "Daily Journal",
    icon: "🌿",
    description: "Reflect on energy, gratitude and lessons.",
    defaultData: () => ({
      entries: [],
      mood: "Balanced",
    }),
    getItems(module) {
      return Array.isArray(module.data.entries) ? module.data.entries : [];
    },
    getItemTitle(entry) {
      return formatDate(entry.date);
    },
    getItemSubtitle(entry) {
      return entry.body ? entry.body.slice(0, 60) : "";
    },
    render({ module, container }) {
      const moodRow = createEl("div", "inline-form");
      moodRow.style.gridTemplateColumns = "repeat(auto-fit, minmax(160px, 1fr))";
      moodRow.innerHTML = `
        <div class="form-row">
          <label>Energy</label>
          <select name="mood">
            <option>Balanced</option>
            <option>Elevated</option>
            <option>Drained</option>
            <option>Curious</option>
          </select>
        </div>
      `;
      const moodSelect = moodRow.querySelector("select");
      moodSelect.value = module.data.mood || "Balanced";
      moodSelect.addEventListener("change", () => {
        mutateModule(module.id, (draft) => {
          draft.data.mood = moodSelect.value;
        }, { silent: true });
      });

      const entries = createEl("div", "list");
      this.getItems(module).forEach((entry, index) => {
        const card = createEl("div", "note-card");
        const date = createEl("strong");
        date.textContent = formatDate(entry.date);
        const body = document.createElement("textarea");
        body.value = entry.body;
        body.placeholder = "What resonated today?";
        body.addEventListener("input", () => {
          mutateModule(module.id, (draft) => {
            draft.data.entries[index].body = body.value;
          }, { silent: true });
        });
        const removeBtn = createIconButton("Remove entry", "✕");
        removeBtn.style.justifySelf = "end";
        removeBtn.addEventListener("click", () => {
          mutateModule(module.id, (draft) => {
            draft.data.entries.splice(index, 1);
          });
        });
        card.append(date, body, removeBtn);
        entries.append(card);
      });

      if (!this.getItems(module).length) {
        const empty = createEl("div", "empty");
        empty.innerHTML = `
          <h3>No reflections saved</h3>
          <p>End your day with a light gratitude note.</p>
        `;
        entries.append(empty);
      }

      const form = createEl("form", "inline-form");
      form.innerHTML = `
        <div class="form-row">
          <label>Reflection</label>
          <textarea name="body" placeholder="Capture a gratitude, highlight or lesson." required></textarea>
        </div>
        <button type="submit">Log entry</button>
      `;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = form.querySelector("textarea[name=body]").value.trim();
        if (!text) {
          return;
        }
        mutateModule(module.id, (draft) => {
          draft.data.entries.unshift({
            id: createId(),
            body: text,
            date: new Date().toISOString().slice(0, 10),
          });
        });
        form.reset();
      });

      container.append(moodRow, entries, form);
    },
  },
};

const navSections = [
  { type: "projects", label: "Projects" },
  { type: "clients", label: "Clients" },
  { type: "tasks", label: "Tasks" },
  { type: "notes", label: "Notes" },
];

const moduleOrder = Object.keys(moduleDefinitions);

const controls = { initialized: false };
const navigation = { initialized: false, buttons: [], activeModuleId: null };

const state = loadState();
applyTheme(state.theme);
applyDensity(state.density);
renderAddModuleOptions();
renderSnapshots();
initializeNavigation();
renderModules();
updateFocusMode();
setupControls();

function setupControls() {
  if (!controls.initialized) {
    controls.background = document.getElementById("backgroundColor");
    controls.surface = document.getElementById("surfaceColor");
    controls.accent = document.getElementById("accentColor");
    controls.text = document.getElementById("textColor");
    controls.density = document.getElementById("densitySlider");
    controls.restore = document.getElementById("restorePalette");
    controls.addSelect = document.getElementById("addModuleSelect");
    controls.addButton = document.getElementById("addModuleButton");
    controls.saveSnapshot = document.getElementById("saveSnapshot");
    controls.focusToggle = document.getElementById("focusModeToggle");

    controls.background.addEventListener("input", () =>
      updateTheme("background", controls.background.value),
    );
    controls.surface.addEventListener("input", () =>
      updateTheme("surface", controls.surface.value),
    );
    controls.accent.addEventListener("input", () =>
      updateTheme("accent", controls.accent.value),
    );
    controls.text.addEventListener("input", () =>
      updateTheme("text", controls.text.value),
    );

    controls.density.addEventListener("input", () => {
      state.density = Number(controls.density.value);
      applyDensity(state.density);
      persistState();
    });

    controls.restore.addEventListener("click", () => {
      state.theme = { ...defaultPalette };
      applyTheme(state.theme);
      refreshControlValues();
      persistState();
    });

    controls.addButton.addEventListener("click", () => {
      const type = controls.addSelect.value;
      if (!type) return;
      addModule(type);
    });

    controls.saveSnapshot.addEventListener("click", () => {
      const name = window.prompt("Name this snapshot", suggestSnapshotName());
      if (!name) return;
      const snapshot = {
        id: createId(),
        name,
        state: serializeSnapshot(),
        createdAt: Date.now(),
      };
      state.snapshots.unshift(snapshot);
      persistState();
      renderSnapshots();
    });

    controls.focusToggle.addEventListener("click", () => {
      state.focusMode = !state.focusMode;
      updateFocusMode();
      persistState();
    });

    controls.initialized = true;
  }

  refreshControlValues();
}

function refreshControlValues() {
  if (!controls.initialized) return;
  controls.background.value = state.theme.background;
  controls.surface.value = state.theme.surface;
  controls.accent.value = state.theme.accent;
  controls.text.value = state.theme.text;
  controls.density.value = state.density;
}

function initializeNavigation() {
  if (navigation.initialized) return;
  const container = document.getElementById("primaryNav");
  if (!container) return;
  navSections.forEach((section) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = section.label;
    button.addEventListener("click", () => handleNavClick(section.type));
    container.append(button);
    navigation.buttons.push({ button, type: section.type });
  });
  navigation.initialized = true;
  updateNavigation();
}

function handleNavClick(type) {
  const module = state.modules.find((item) => item.type === type);
  if (!module) return;
  navigation.activeModuleId = module.id;
  updateNavigation();
  focusModuleById(module.id);
}

function updateNavigation() {
  if (!navigation.initialized) return;
  navigation.buttons.forEach(({ button, type }) => {
    const module = state.modules.find((item) => item.type === type);
    if (!module) {
      button.disabled = true;
      button.classList.remove("active");
      button.dataset.target = "";
      return;
    }
    button.disabled = false;
    button.dataset.target = module.id;
  });

  if (
    !navigation.activeModuleId ||
    !state.modules.some((module) => module.id === navigation.activeModuleId)
  ) {
    const prioritized = navSections
      .map((section) => state.modules.find((module) => module.type === section.type))
      .find(Boolean);
    navigation.activeModuleId = prioritized ? prioritized.id : state.modules[0]?.id || null;
  }

  navigation.buttons.forEach(({ button }) => {
    button.classList.toggle(
      "active",
      Boolean(
        navigation.activeModuleId && button.dataset.target === navigation.activeModuleId,
      ),
    );
  });
}

function focusModuleById(moduleId) {
  if (!moduleId) return;
  const element = document.querySelector(`.module[data-id="${moduleId}"]`);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("entity-highlight");
  window.setTimeout(() => {
    element.classList.remove("entity-highlight");
  }, 1200);
}

function renderModules() {
  const grid = document.getElementById("modulesGrid");
  grid.innerHTML = "";
  if (!state.modules.length) {
    const template = document.getElementById("emptyStateTemplate");
    const clone = template.content.cloneNode(true);
    grid.append(clone);
    return;
  }

  state.modules.forEach((module) => {
    const def = moduleDefinitions[module.type];
    if (!def) return;
    const card = createEl("section", "module");
    card.dataset.id = module.id;
    card.dataset.type = module.type;
    card.setAttribute("draggable", "true");
    card.dataset.ghostLabel = module.name || def.name;
    card.id = module.id;

    const header = createEl("div", "module__header");
    const title = createEl("div", "module__title");
    title.innerHTML = `<span>${def.icon}</span><span>${escapeHtml(
      module.name || def.name,
    )}</span>`;

    const tools = createEl("div", "module__tools");

    const infoBtn = createIconButton("Describe", "ℹ️");
    infoBtn.addEventListener("click", () => {
      showToast(def.description);
    });

    const renameBtn = createIconButton("Rename", "✏️");
    renameBtn.addEventListener("click", () => {
      const next = window.prompt("Rename module", module.name || def.name);
      if (next === null) return;
      mutateModule(module.id, (draft) => {
        draft.name = next.trim();
      });
    });

    const removeBtn = createIconButton("Remove", "🗑");
    removeBtn.addEventListener("click", () => {
      const confirmed = window.confirm("Remove this module? You can add it again later.");
      if (!confirmed) return;
      state.modules = state.modules.filter((m) => m.id !== module.id);
      cleanupRelationships();
      persistState();
      renderModules();
    });

    const moveUp = createIconButton("Move up", "▲");
    moveUp.addEventListener("click", () => reorderModule(module.id, -1));
    const moveDown = createIconButton("Move down", "▼");
    moveDown.addEventListener("click", () => reorderModule(module.id, 1));

    tools.append(infoBtn, renameBtn, moveUp, moveDown, removeBtn);

    header.append(title, tools);
    card.append(header);

    const body = createEl("div");
    def.render({ module, container: body });
    card.append(body);

    attachDrag(card);

    grid.append(card);
  });
  updateNavigation();
}

function enableItemReorder(container, module, getCollection) {
  const items = Array.from(container.querySelectorAll("[data-item-id]"));
  if (!items.length) return;
  let dragging = null;
  items.forEach((item) => {
    item.setAttribute("draggable", "true");
    item.addEventListener("dragstart", (event) => {
      dragging = item;
      item.classList.add("dragging");
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.dataset.itemId || "");
      showDragGhost(item, event.clientX, event.clientY);
    });
    item.addEventListener("dragend", () => {
      if (dragging === item) {
        dragging = null;
      }
      item.classList.remove("dragging");
      hideDragGhost();
    });
  });

  container.addEventListener("dragover", (event) => {
    if (!dragging) return;
    event.preventDefault();
    event.stopPropagation();
    const afterElement = getDragAfterElement(
      container,
      event.clientY,
      "[data-item-id]:not(.dragging)",
    );
    if (!afterElement) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
    showDragGhost(dragging, event.clientX, event.clientY);
  });

  container.addEventListener("drop", () => {
    if (!dragging) return;
    const order = Array.from(
      container.querySelectorAll("[data-item-id]"),
      (element) => element.dataset.itemId,
    );
    mutateModule(module.id, (draft) => {
      const collection = getCollection(draft);
      if (!Array.isArray(collection)) return;
      collection.sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      );
    });
    dragging = null;
  });
}

function describeEntity(module, item) {
  if (!item || !item.id) return null;
  const def = moduleDefinitions[module.type];
  if (!def) return null;
  const label =
    (def.getItemTitle && def.getItemTitle(item, module)) ||
    item.title ||
    item.name ||
    "Untitled";
  const subtitle =
    (def.getItemSubtitle && def.getItemSubtitle(item, module)) ||
    item.subtitle ||
    "";
  return {
    id: item.id,
    label,
    subtitle,
    icon: def.icon || "•",
    moduleId: module.id,
    moduleType: module.type,
    moduleName: module.name || def.name,
  };
}

function collectEntities() {
  const entities = [];
  state.modules.forEach((module) => {
    const def = moduleDefinitions[module.type];
    if (!def || !def.supportsRelationships || typeof def.getItems !== "function") return;
    const items = def.getItems(module);
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      const entity = describeEntity(module, item);
      if (entity) {
        entities.push(entity);
      }
    });
  });
  return entities;
}

function getRelatedEntities(entityId) {
  const allEntities = collectEntities();
  const index = new Map(allEntities.map((entity) => [entity.id, entity]));
  const relationships = state.relationships?.[entityId] || [];
  return relationships
    .map((id) => index.get(id))
    .filter(Boolean);
}

function createRelationshipsBlock(entity, options = {}) {
  const variant = options.variant || "card";
  const wrapper = createEl(
    "div",
    `module__relationships${variant === "inline" ? " module__relationships--inline" : ""}`,
  );
  const header = createEl("div", "module__relationships-header");
  const label = document.createElement("span");
  label.textContent = variant === "inline" ? "Links" : "Linked work";
  const manageBtn = document.createElement("button");
  manageBtn.type = "button";
  manageBtn.className = "relationship-manage";
  manageBtn.addEventListener("click", () => openRelationshipManager(entity));
  header.append(label, manageBtn);
  wrapper.append(header);

  const related = getRelatedEntities(entity.id);
  manageBtn.textContent = related.length ? "Edit links" : "Add link";
  if (!related.length) {
    if (variant !== "inline") {
      const empty = createEl("p", "relationship-empty");
      empty.textContent = "No relationships yet.";
      wrapper.append(empty);
    }
  } else {
    const list = createEl("div", "relationship-list");
    related.forEach((target) => {
      const chip = createEl("button", "relationship-chip");
      chip.type = "button";
      chip.innerHTML = `<span>${target.icon}</span><span>${escapeHtml(target.label)}</span>`;
      chip.addEventListener("click", () => focusEntityById(target.id));
      list.append(chip);
    });
    wrapper.append(list);
  }

  return wrapper;
}

function focusEntityById(entityId) {
  if (!entityId) return;
  const entities = collectEntities();
  const target = entities.find((entity) => entity.id === entityId);
  if (!target) return;
  navigation.activeModuleId = target.moduleId;
  updateNavigation();
  focusModuleById(target.moduleId);
  window.setTimeout(() => {
    const element = document.querySelector(`[data-item-id="${entityId}"]`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("entity-highlight");
    window.setTimeout(() => {
      element.classList.remove("entity-highlight");
    }, 1200);
  }, 260);
}

function openRelationshipManager(entity) {
  const overlay = createEl("div", "relationship-modal");
  const panel = createEl("div", "relationship-modal__panel");
  const header = createEl("div", "relationship-modal__header");
  const title = document.createElement("h3");
  title.textContent = `Link ${entity.label}`;
  const closeBtn = createIconButton("Close", "✕");
  closeBtn.addEventListener("click", () => close());
  header.append(title, closeBtn);

  const body = createEl("div", "relationship-modal__body");
  const allEntities = collectEntities().filter((item) => item.id !== entity.id);
  const grouped = new Map();
  allEntities.forEach((item) => {
    if (!grouped.has(item.moduleId)) {
      grouped.set(item.moduleId, {
        moduleId: item.moduleId,
        moduleName: item.moduleName,
        moduleType: item.moduleType,
        items: [],
      });
    }
    grouped.get(item.moduleId).items.push(item);
  });

  const orderMap = new Map(navSections.map((section, index) => [section.type, index]));
  const groups = Array.from(grouped.values()).sort((a, b) => {
    const orderA = orderMap.get(a.moduleType) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.get(b.moduleType) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.moduleName.localeCompare(b.moduleName);
  });

  const current = new Set(state.relationships?.[entity.id] || []);

  if (!groups.length) {
    const empty = createEl("p", "relationship-empty");
    empty.textContent =
      "Add more projects, clients, tasks or notes to build relationships.";
    body.append(empty);
  } else {
    groups.forEach((group) => {
      group.items.sort((a, b) => a.label.localeCompare(b.label));
      const section = createEl("div", "relationship-modal__section");
      const heading = document.createElement("h4");
      const icon = moduleDefinitions[group.moduleType]?.icon || "•";
      heading.textContent = `${icon} ${group.moduleName}`;
      section.append(heading);

      const list = createEl("div", "relationship-modal__list");
      group.items.forEach((item) => {
        const row = createEl("label", "relationship-modal__item");
        const inputId = `rel-${entity.id}-${item.id}`;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = inputId;
        checkbox.value = item.id;
        checkbox.checked = current.has(item.id);
        const text = document.createElement("span");
        text.innerHTML = `<strong>${escapeHtml(item.label)}</strong>${item.subtitle
          ? `<br><small style="color: var(--text-muted);">${escapeHtml(item.subtitle)}</small>`
          : ""}`;
        row.append(checkbox, text);
        list.append(row);
      });
      section.append(list);
      body.append(section);
    });
  }

  const footer = createEl("div", "relationship-modal__footer");
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "ghost";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => close());
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save links";
  saveBtn.addEventListener("click", () => {
    const selected = Array.from(
      overlay.querySelectorAll('input[type="checkbox"]:checked'),
      (input) => input.value,
    );
    setEntityRelationships(entity.id, selected);
    close();
  });
  footer.append(cancelBtn, saveBtn);

  const close = () => {
    document.removeEventListener("keydown", handleKeydown);
    overlay.remove();
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener("keydown", handleKeydown);
  panel.append(header, body, footer);
  overlay.append(panel);
  document.body.append(overlay);
}

function setEntityRelationships(entityId, targetIds) {
  if (!state.relationships || typeof state.relationships !== "object") {
    state.relationships = {};
  }
  const uniqueTargets = Array.from(
    new Set((targetIds || []).filter((id) => id && id !== entityId)),
  );
  const currentTargets = new Set(state.relationships[entityId] || []);
  uniqueTargets.forEach((targetId) => addRelationshipPair(entityId, targetId));
  currentTargets.forEach((targetId) => {
    if (!uniqueTargets.includes(targetId)) {
      removeRelationshipPair(entityId, targetId);
    }
  });
  cleanupRelationships();
  persistState();
  renderModules();
}

function addRelationshipPair(a, b) {
  if (a === b) return;
  if (!state.relationships[a]) {
    state.relationships[a] = [];
  }
  if (!state.relationships[b]) {
    state.relationships[b] = [];
  }
  if (!state.relationships[a].includes(b)) {
    state.relationships[a].push(b);
  }
  if (!state.relationships[b].includes(a)) {
    state.relationships[b].push(a);
  }
}

function removeRelationshipPair(a, b) {
  if (!state.relationships[a]) return;
  state.relationships[a] = state.relationships[a].filter((id) => id !== b);
  if (!state.relationships[a].length) {
    delete state.relationships[a];
  }
  if (state.relationships[b]) {
    state.relationships[b] = state.relationships[b].filter((id) => id !== a);
    if (!state.relationships[b].length) {
      delete state.relationships[b];
    }
  }
}

function cleanupRelationships() {
  state.relationships = sanitizeRelationships(state.relationships, state.modules);
}

function sanitizeRelationships(rawRelationships, modules) {
  if (!rawRelationships || typeof rawRelationships !== "object") {
    return {};
  }
  const validIds = new Set();
  modules.forEach((module) => {
    const def = moduleDefinitions[module.type];
    if (!def || !def.supportsRelationships || typeof def.getItems !== "function") return;
    const items = def.getItems(module);
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item && item.id) {
        validIds.add(item.id);
      }
    });
  });
  const sanitized = {};
  Object.entries(rawRelationships).forEach(([sourceId, targets]) => {
    if (!validIds.has(sourceId)) {
      return;
    }
    const uniqueTargets = Array.from(
      new Set(
        (Array.isArray(targets) ? targets : []).filter(
          (targetId) => validIds.has(targetId) && targetId !== sourceId,
        ),
      ),
    );
    if (uniqueTargets.length) {
      sanitized[sourceId] = uniqueTargets;
    }
  });
  return sanitized;
}

function ensureEntityIds(collection) {
  if (!Array.isArray(collection)) return [];
  collection.forEach((item) => {
    if (item && !item.id) {
      item.id = createId();
    }
  });
  return collection;
}

function renderAddModuleOptions() {
  const select = document.getElementById("addModuleSelect");
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a module";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);
  moduleOrder.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = `${moduleDefinitions[type].icon} ${moduleDefinitions[type].name}`;
    select.append(option);
  });
}

function renderSnapshots() {
  const list = document.getElementById("snapshotList");
  list.innerHTML = "";
  if (!state.snapshots.length) {
    const empty = createEl("p");
    empty.textContent = "No saved snapshots yet.";
    empty.style.margin = "0";
    empty.style.color = "var(--text-muted)";
    list.append(empty);
    return;
  }

  state.snapshots.forEach((snapshot, index) => {
    const item = createEl("div", "snapshot");
    const label = createEl("div");
    label.style.display = "grid";
    label.style.gap = "0.25rem";
    label.innerHTML = `<strong>${escapeHtml(snapshot.name)}</strong><span style="color: var(--text-muted); font-size: 0.78rem;">${new Date(
      snapshot.createdAt,
    ).toLocaleString()}</span>`;

    const actions = createEl("div");
    actions.style.display = "flex";
    actions.style.gap = "0.35rem";

    const apply = createIconButton("Apply", "↺");
    apply.addEventListener("click", () => {
      applySnapshot(snapshot);
    });

    const remove = createIconButton("Remove", "✕");
    remove.addEventListener("click", () => {
      state.snapshots.splice(index, 1);
      persistState();
      renderSnapshots();
    });

    actions.append(apply, remove);
    item.append(label, actions);
    list.append(item);
  });
}

function reorderModule(id, offset) {
  const index = state.modules.findIndex((module) => module.id === id);
  if (index === -1) return;
  const nextIndex = index + offset;
  if (nextIndex < 0 || nextIndex >= state.modules.length) return;
  const modules = [...state.modules];
  const [removed] = modules.splice(index, 1);
  modules.splice(nextIndex, 0, removed);
  state.modules = modules;
  persistState();
  renderModules();
}

function attachDrag(card) {
  card.addEventListener("dragstart", (event) => {
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.dataset.id);
    showDragGhost(card, event.clientX, event.clientY);
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    hideDragGhost();
    persistState();
  });
}

const modulesGrid = document.getElementById("modulesGrid");
modulesGrid.addEventListener("dragover", (event) => {
  event.preventDefault();
  const dragging = document.querySelector(".module.dragging");
  if (!dragging) return;
  const afterElement = getDragAfterElement(
    modulesGrid,
    event.clientY,
    ".module:not(.dragging)",
  );
  if (!afterElement) {
    modulesGrid.appendChild(dragging);
  } else {
    modulesGrid.insertBefore(dragging, afterElement);
  }
  showDragGhost(dragging, event.clientX, event.clientY);
});

modulesGrid.addEventListener("drop", () => {
  const ids = Array.from(modulesGrid.querySelectorAll(".module"), (el) => el.dataset.id);
  state.modules.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  persistState();
  renderModules();
});

function getDragAfterElement(container, y, selector = ".module:not(.dragging)") {
  const elements = [...container.querySelectorAll(selector)];
  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null },
  ).element;
}

function showDragGhost(element, x, y, label) {
  const ghost = document.getElementById("dragGhost");
  const text =
    label ||
    element.dataset?.ghostLabel ||
    element.querySelector?.(".module__title span:last-child")?.textContent ||
    element.textContent?.trim() ||
    "Moving";
  ghost.textContent = text;
  ghost.style.left = `${x + 16}px`;
  ghost.style.top = `${y + 16}px`;
  ghost.classList.add("visible");
}

function hideDragGhost() {
  document.getElementById("dragGhost").classList.remove("visible");
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty(
    "--text-muted",
    withAlpha(theme.text, 0.65),
  );
  root.style.setProperty(
    "--border",
    withAlpha(theme.text, 0.1),
  );
}

function applyDensity(value) {
  document.documentElement.style.setProperty("--card-min-width", `${value}px`);
}

function updateTheme(key, value) {
  state.theme[key] = value;
  applyTheme(state.theme);
  persistState();
}

function updateFocusMode() {
  document.body.classList.toggle("focus-mode", !!state.focusMode);
  const button = document.getElementById("focusModeToggle");
  button.textContent = state.focusMode ? "Exit focus mode" : "Enter focus mode";
}

function addModule(type) {
  if (!moduleDefinitions[type]) return;
  state.modules.push(createModule(type));
  persistState();
  renderModules();
  if (controls.initialized) {
    controls.addSelect.selectedIndex = 0;
  }
}

function createModule(type) {
  const definition = moduleDefinitions[type];
  return {
    id: createId(),
    type,
    name: "",
    data: definition.defaultData(),
  };
}

function mutateModule(id, mutate, options = {}) {
  const modules = state.modules.map((module) => {
    if (module.id !== id) return module;
    const clone = deepClone(module);
    mutate(clone);
    validateModule(clone);
    return clone;
  });
  state.modules = modules;
  cleanupRelationships();
  persistState();
  if (!options.silent) {
    renderModules();
  }
}

function validateModule(module) {
  const def = moduleDefinitions[module.type];
  if (!def) return;
  if (["projects", "tasks", "notes", "clients"].includes(module.type)) {
    module.data.items = Array.isArray(module.data.items) ? module.data.items : [];
    ensureEntityIds(module.data.items);
  }
  if (module.type === "journal") {
    module.data.entries = Array.isArray(module.data.entries) ? module.data.entries : [];
    ensureEntityIds(module.data.entries);
  }
}

function openProjectEditor(moduleId, index) {
  const module = state.modules.find((m) => m.id === moduleId);
  if (!module) return;
  const project = module.data.items[index];
  if (!project) return;
  const nextTitle = window.prompt("Project name", project.title);
  if (nextTitle === null) return;
  const nextStatus = window.prompt("Status", project.status) ?? project.status;
  const nextOwner = window.prompt("Owner", project.owner ?? "") ?? project.owner;
  mutateModule(moduleId, (draft) => {
    const target = draft.data.items[index];
    target.title = nextTitle.trim() || target.title;
    target.status = (nextStatus || target.status).trim();
    target.owner = (nextOwner || target.owner).trim();
  });
}

function openClientEditor(moduleId, index) {
  const module = state.modules.find((m) => m.id === moduleId);
  if (!module) return;
  const client = module.data.items[index];
  if (!client) return;
  const nextName = window.prompt("Client name", client.name || "");
  if (nextName === null) return;
  const nextContact = window.prompt("Primary contact", client.contact || "");
  const nextFocus = window.prompt("Focus", client.focus || "");
  const nextStatus = window.prompt("Status", client.status || "");
  mutateModule(moduleId, (draft) => {
    const target = draft.data.items[index];
    if (!target) return;
    target.name = nextName.trim() || target.name;
    target.contact = (nextContact ?? target.contact ?? "").trim();
    target.focus = (nextFocus ?? target.focus ?? "").trim();
    target.status = (nextStatus ?? target.status ?? "").trim();
  });
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Unable to save state", error);
  }
}

function serializeSnapshot() {
  return {
    theme: deepClone(state.theme),
    density: state.density,
    modules: deepClone(state.modules),
    relationships: deepClone(state.relationships || {}),
  };
}

function applySnapshot(snapshot) {
  state.theme = deepClone(snapshot.state.theme);
  state.density = snapshot.state.density;
  state.modules = deepClone(snapshot.state.modules);
  state.relationships = sanitizeRelationships(snapshot.state.relationships, state.modules);
  applyTheme(state.theme);
  applyDensity(state.density);
  persistState();
  renderModules();
  renderSnapshots();
  refreshControlValues();
}

function suggestSnapshotName() {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Snapshot ${day} ${time}`;
}

function withAlpha(hexColor, alpha) {
  const rgb = hexToRgb(hexColor) || { r: 47, g: 36, b: 29 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex) {
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function formatDate(value) {
  if (!value) return "No due";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  return el;
}

function createIconButton(label, icon) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost";
  button.textContent = `${icon}`;
  button.title = label;
  button.setAttribute("aria-label", label);
  return button;
}

function showToast(message) {
  const toast = createEl("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "2rem";
  toast.style.right = "2rem";
  toast.style.padding = "0.85rem 1.2rem";
  toast.style.background = "var(--text)";
  toast.style.color = "var(--surface)";
  toast.style.borderRadius = "var(--radius-sm)";
  toast.style.boxShadow = "var(--shadow-soft)";
  toast.style.zIndex = "999";
  document.body.append(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 160ms ease";
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2400);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("Empty state");
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const modules = Array.isArray(parsed.modules) && parsed.modules.length
      ? parsed.modules.map((module) => sanitizeModule(module)).filter(Boolean)
      : base.modules;
    const relationships = sanitizeRelationships(parsed.relationships, modules);
    const fallbackSnapshot = {
      theme: deepClone(base.theme),
      density: base.density,
      modules: deepClone(modules),
      relationships: deepClone(relationships),
    };
    const snapshots = Array.isArray(parsed.snapshots)
      ? parsed.snapshots.map((snapshot) => ({
          ...snapshot,
          state: sanitizeSnapshotState(snapshot.state, fallbackSnapshot),
        }))
      : [];
    return {
      ...base,
      ...parsed,
      theme: { ...base.theme, ...parsed.theme },
      modules,
      snapshots,
      focusMode: Boolean(parsed.focusMode),
      density: parsed.density || base.density,
      relationships,
    };
  } catch (error) {
    return defaultState();
  }
}

function sanitizeModule(module) {
  if (!module || !moduleDefinitions[module.type]) return null;
  return {
    id: module.id || createId(),
    type: module.type,
    name: module.name || "",
    data: sanitizeModuleData(module),
  };
}

function sanitizeSnapshotState(snapshotState, fallback) {
  if (!snapshotState || typeof snapshotState !== "object") {
    return deepClone(fallback);
  }
  const modules = (() => {
    if (Array.isArray(snapshotState.modules) && snapshotState.modules.length) {
      const sanitized = snapshotState.modules
        .map((module) => sanitizeModule(module))
        .filter(Boolean);
      if (sanitized.length) {
        return sanitized;
      }
    }
    return deepClone(fallback.modules);
  })();
  return {
    theme: { ...defaultPalette, ...(snapshotState.theme || {}) },
    density: snapshotState.density || fallback.density,
    modules,
    relationships: sanitizeRelationships(snapshotState.relationships, modules),
  };
}

function sanitizeModuleData(module) {
  const definition = moduleDefinitions[module.type];
  const fallback = definition.defaultData();
  if (!module.data || typeof module.data !== "object") return fallback;
  const data = deepClone(module.data);
  if (module.type === "projects") {
    data.items = Array.isArray(data.items) ? data.items : fallback.items;
    ensureEntityIds(data.items);
  }
  if (module.type === "tasks") {
    data.items = Array.isArray(data.items) ? data.items : fallback.items;
    ensureEntityIds(data.items);
  }
  if (module.type === "notes") {
    data.items = Array.isArray(data.items) ? data.items : fallback.items;
    ensureEntityIds(data.items);
  }
  if (module.type === "clients") {
    data.items = Array.isArray(data.items) ? data.items : fallback.items;
    ensureEntityIds(data.items);
  }
  if (module.type === "journal") {
    data.entries = Array.isArray(data.entries) ? data.entries : fallback.entries;
    data.mood = data.mood || fallback.mood;
    ensureEntityIds(data.entries);
  }
  return data;
}

function defaultState() {
  return {
    theme: { ...defaultPalette },
    density: 380,
    focusMode: false,
    modules: [
      createModule("projects"),
      createModule("clients"),
      createModule("tasks"),
      createModule("notes"),
    ],
    snapshots: [],
    relationships: {},
  };
}

window.addEventListener("mousemove", (event) => {
  const ghost = document.getElementById("dragGhost");
  if (!ghost.classList.contains("visible")) return;
  ghost.style.left = `${event.clientX + 16}px`;
  ghost.style.top = `${event.clientY + 16}px`;
});
