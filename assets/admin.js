import {
  isFirebaseConfigured,
  observeAuth,
  signIn,
  signOutUser,
  getSupervisorProfile,
  observeProjects,
  saveProject,
  seedProjects
} from "./firebase-service.js";

(() => {
  const baseProjects = Array.isArray(window.PROJECTS) ? window.PROJECTS.map((item) => ({ ...item })) : [];
  const baseById = new Map(baseProjects.map((item) => [item.id, item]));

  const loginView = document.getElementById("loginView");
  const setupView = document.getElementById("setupView");
  const workspaceView = document.getElementById("workspaceView");
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const signedInAs = document.getElementById("signedInAs");
  const signOutButton = document.getElementById("signOutButton");
  const seedButton = document.getElementById("seedButton");
  const seedNotice = document.getElementById("seedNotice");
  const adminSearch = document.getElementById("adminSearch");
  const adminStatusFilter = document.getElementById("adminStatusFilter");
  const adminRows = document.getElementById("adminRows");
  const adminCount = document.getElementById("adminCount");
  const recordForm = document.getElementById("recordForm");
  const formMessage = document.getElementById("formMessage");
  const formTitle = document.getElementById("formTitle");
  const emptyForm = document.getElementById("emptyForm");
  const resetFormButton = document.getElementById("resetFormButton");

  let currentUser = null;
  let supervisor = null;
  let currentProjects = [];
  let selectedId = null;
  let unsubscribeProjects = null;

  const statuses = [
    "Approved",
    "Approved · scope confirmation",
    "Clarification required",
    "Reassigned",
    "New topic required"
  ];

  const safe = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));

  function notice(target, message = "", type = "") {
    target.textContent = message;
    target.className = `form-note${type ? ` ${type}` : ""}`;
    target.hidden = !message;
  }

  function normaliseRemote(remoteRecords) {
    const remoteById = new Map(remoteRecords.map((item) => [item.id, item]));
    const merged = baseProjects.map((project) => ({ ...project, ...(remoteById.get(project.id) || {}) }));
    remoteRecords.forEach((project) => {
      if (!baseById.has(project.id)) merged.push(project);
    });
    return merged.sort((a, b) => a.student.localeCompare(b.student));
  }

  function recordDisplayNumber(project) {
    const index = currentProjects.findIndex((item) => item.id === project.id);
    return String(index + 1).padStart(2, "0");
  }

  function renderStatusOptions() {
    adminStatusFilter.innerHTML = ["<option value=\"all\">All proposal decisions</option>", ...statuses.map((status) => `<option value="${safe(status)}">${safe(status)}</option>`)].join("");
  }

  function filteredProjects() {
    const query = adminSearch.value.trim().toLowerCase();
    return currentProjects.filter((project) => {
      const searchable = [project.student, project.title, project.domain, project.status, project.summary, project.proposalStage, project.note].join(" ").toLowerCase();
      const meetsSearch = !query || searchable.includes(query);
      const meetsStatus = adminStatusFilter.value === "all" || project.status === adminStatusFilter.value;
      return meetsSearch && meetsStatus;
    });
  }

  function renderList() {
    const records = filteredProjects();
    adminRows.innerHTML = records.map((project) => {
      const selected = project.id === selectedId ? " is-selected" : "";
      const links = [project.proposalUrl, project.githubUrl, project.trelloUrl, project.workspaceUrl].filter(Boolean).length;
      return `<tr class="${selected}">
        <td class="record-number">${recordDisplayNumber(project)}</td>
        <td><strong>${safe(project.student)}</strong><span>${safe(project.title)}</span></td>
        <td>${safe(project.status)}</td>
        <td>${links}/4</td>
        <td><button class="table-action" type="button" data-edit-id="${safe(project.id)}">Edit record</button></td>
      </tr>`;
    }).join("");
    adminCount.textContent = `${records.length} of ${currentProjects.length} records`;

    adminRows.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => selectRecord(button.dataset.editId));
    });
  }

  function setFormEnabled(enabled) {
    recordForm.querySelectorAll("input, textarea, select, button").forEach((element) => {
      element.disabled = !enabled;
    });
  }

  function clearForm() {
    selectedId = null;
    recordForm.reset();
    formTitle.textContent = "Select a project record";
    emptyForm.hidden = false;
    setFormEnabled(false);
    notice(formMessage, "");
    renderList();
  }

  function setValue(name, value) {
    const field = recordForm.elements.namedItem(name);
    if (field) field.value = value || "";
  }

  function selectRecord(id) {
    const record = currentProjects.find((item) => item.id === id);
    if (!record) return;
    selectedId = id;
    formTitle.textContent = `Edit record ${recordDisplayNumber(record)} · ${record.student}`;
    emptyForm.hidden = true;
    setFormEnabled(true);
    notice(formMessage, "");

    ["id", "student", "initials", "title", "domain", "status", "proposalStage", "summary", "note", "proposalUrl", "githubUrl", "trelloUrl", "workspaceUrl"].forEach((key) => setValue(key, record[key]));
    renderList();
    document.getElementById("student").focus();
  }

  function validateUrl(value, label) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      const url = new URL(trimmed);
      if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported protocol");
      return url.href;
    } catch {
      throw new Error(`${label} must be a complete http:// or https:// link.`);
    }
  }

  function formData() {
    const form = new FormData(recordForm);
    const project = Object.fromEntries(form.entries());
    project.id = String(project.id || "").trim();
    project.student = String(project.student || "").trim();
    project.initials = String(project.initials || "").trim().toUpperCase();
    project.title = String(project.title || "").trim();
    project.domain = String(project.domain || "").trim();
    project.status = String(project.status || "").trim();
    project.proposalStage = String(project.proposalStage || "").trim();
    project.summary = String(project.summary || "").trim();
    project.note = String(project.note || "").trim();
    project.proposalUrl = validateUrl(String(project.proposalUrl || ""), "Proposal link");
    project.githubUrl = validateUrl(String(project.githubUrl || ""), "GitHub link");
    project.trelloUrl = validateUrl(String(project.trelloUrl || ""), "Trello link");
    project.workspaceUrl = validateUrl(String(project.workspaceUrl || ""), "Working directory link");

    const required = [["student", "Student name"], ["title", "System title"], ["domain", "System sector"], ["status", "Proposal decision"], ["proposalStage", "Project stage"], ["summary", "Proposal summary"]];
    const missing = required.find(([key]) => !project[key]);
    if (missing) throw new Error(`${missing[1]} is required.`);
    return project;
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedId || !currentUser) return;
    try {
      const submitButton = recordForm.querySelector("button[type=submit]");
      const project = formData();
      if (project.id !== selectedId) throw new Error("The permanent record ID cannot be changed.");
      submitButton.disabled = true;
      notice(formMessage, "Saving the project record…");
      await saveProject(project, currentUser.email);
      notice(formMessage, "Project record saved to the shared register.", "success");
    } catch (error) {
      notice(formMessage, error.message || "The project record could not be saved.", "error");
    } finally {
      const submitButton = recordForm.querySelector("button[type=submit]");
      submitButton.disabled = false;
    }
  }

  async function handleSeed() {
    if (!currentUser) return;
    const confirmed = window.confirm(`Publish the ${baseProjects.length} supplied records to the shared Firestore register? Existing records with matching IDs will be updated.`);
    if (!confirmed) return;
    try {
      seedButton.disabled = true;
      notice(seedNotice, "Publishing the supplied project records…");
      await seedProjects(baseProjects, currentUser.email);
      notice(seedNotice, "The supplied project records are now in the shared register.", "success");
    } catch (error) {
      notice(seedNotice, error.message || "The initial records could not be published.", "error");
    } finally {
      seedButton.disabled = false;
    }
  }

  function showSignedOutState() {
    currentUser = null;
    supervisor = null;
    selectedId = null;
    if (unsubscribeProjects) {
      unsubscribeProjects();
      unsubscribeProjects = null;
    }
    workspaceView.hidden = true;
    signedInAs.hidden = true;
    signOutButton.hidden = true;
    loginView.hidden = false;
    loginForm.reset();
    clearForm();
  }

  async function startSupervisorSession(user) {
    currentUser = user;
    loginView.hidden = true;
    notice(loginMessage, "");
    try {
      supervisor = await getSupervisorProfile(user.uid);
      if (!supervisor?.active) {
        await signOutUser();
        loginView.hidden = false;
        notice(loginMessage, "This account is authenticated but has not been assigned supervisor access. Ask the register administrator to add your Firebase UID to the supervisors collection.", "error");
        return;
      }

      signedInAs.textContent = `${supervisor.name || user.displayName || "Supervisor"} · ${user.email}`;
      signedInAs.hidden = false;
      signOutButton.hidden = false;
      workspaceView.hidden = false;
      unsubscribeProjects = observeProjects((remoteRecords) => {
        currentProjects = normaliseRemote(remoteRecords);
        seedButton.hidden = remoteRecords.length > 0;
        seedNotice.hidden = remoteRecords.length > 0;
        renderList();
        if (selectedId) {
          const selected = currentProjects.find((item) => item.id === selectedId);
          if (selected) selectRecord(selectedId);
        }
      }, (error) => {
        notice(seedNotice, `The shared project register could not be read: ${error.message}`, "error");
      });
    } catch (error) {
      await signOutUser();
      loginView.hidden = false;
      notice(loginMessage, error.message || "Unable to open the supervisor workspace.", "error");
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(loginForm.elements.email.value || "").trim();
    const password = String(loginForm.elements.password.value || "");
    if (!email || !password) {
      notice(loginMessage, "Enter your supervisor email address and password.", "error");
      return;
    }
    const submitButton = loginForm.querySelector("button[type=submit]");
    try {
      submitButton.disabled = true;
      notice(loginMessage, "Signing in…");
      await signIn(email, password);
    } catch (error) {
      notice(loginMessage, "Sign-in was not accepted. Check your email address and password, then try again.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  signOutButton.addEventListener("click", () => signOutUser().catch(() => {}));
  seedButton.addEventListener("click", handleSeed);
  adminSearch.addEventListener("input", renderList);
  adminStatusFilter.addEventListener("change", renderList);
  recordForm.addEventListener("submit", handleSave);
  resetFormButton.addEventListener("click", () => selectedId && selectRecord(selectedId));

  renderStatusOptions();
  setFormEnabled(false);

  if (!isFirebaseConfigured) {
    loginView.hidden = true;
    setupView.hidden = false;
    return;
  }

  observeAuth((user) => {
    if (user) startSupervisorSession(user);
    else showSignedOutState();
  });
})();
