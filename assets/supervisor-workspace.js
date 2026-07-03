(() => {
  const config = window.FYP_REPOSITORY || {};
  const DATA_PATH = String(config.dataPath || "assets/projects.js").replace(/^\/+/, "");
  const statuses = [
    "Approved",
    "Approved · scope confirmation",
    "Clarification required",
    "Reassigned",
    "New topic required"
  ];

  const supervisorDialog = document.getElementById("supervisorDialog");
  const openSupervisorWorkspace = document.getElementById("openSupervisorWorkspace");
  const closeSupervisorWorkspace = document.getElementById("closeSupervisorWorkspace");
  const connectView = document.getElementById("connectView");
  const workspaceView = document.getElementById("workspaceView");
  const connectForm = document.getElementById("connectForm");
  const connectMessage = document.getElementById("connectMessage");
  const connectedAs = document.getElementById("connectedAs");
  const disconnectButton = document.getElementById("disconnectButton");
  const repoOwner = document.getElementById("repoOwner");
  const repoName = document.getElementById("repoName");
  const repoBranch = document.getElementById("repoBranch");
  const githubToken = document.getElementById("githubToken");
  const repositoryLabel = document.getElementById("repositoryLabel");
  const repositoryPath = document.getElementById("repositoryPath");
  const dataFileLabel = document.getElementById("dataFileLabel");
  const lastLoaded = document.getElementById("lastLoaded");
  const reloadRegisterButton = document.getElementById("reloadRegisterButton");
  const adminSearch = document.getElementById("adminSearch");
  const adminStatusFilter = document.getElementById("adminStatusFilter");
  const adminRows = document.getElementById("adminRows");
  const adminCount = document.getElementById("adminCount");
  const newRecordButton = document.getElementById("newRecordButton");
  const recordForm = document.getElementById("recordForm");
  const formMessage = document.getElementById("formMessage");
  const formTitle = document.getElementById("formTitle");
  const emptyForm = document.getElementById("emptyForm");
  const resetFormButton = document.getElementById("resetFormButton");

  let session = null;
  let projects = [];
  let selectedId = null;
  let selectedIsNew = false;
  let dataSha = null;

  const safe = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));

  function notice(target, message = "", type = "") {
    target.textContent = message;
    target.className = `form-note${type ? ` ${type}` : ""}`;
    target.hidden = !message;
  }

  function deriveRepository() {
    const configured = {
      owner: String(config.owner || "").trim(),
      repository: String(config.repository || "").trim(),
      branch: String(config.branch || "main").trim() || "main"
    };
    if (configured.owner && configured.repository) return configured;

    const host = window.location.hostname;
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (host.endsWith(".github.io") && segments.length) {
      return { owner: host.split(".")[0], repository: segments[0], branch: configured.branch };
    }
    return { owner: "", repository: "", branch: configured.branch };
  }

  function initialiseConnectionFields() {
    const inferred = deriveRepository();
    repoOwner.value = inferred.owner;
    repoName.value = inferred.repository;
    repoBranch.value = inferred.branch;
    dataFileLabel.textContent = DATA_PATH;
  }

  function apiUrl(path) {
    return `https://api.github.com${path}`;
  }

  function headers() {
    return {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${session.token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  async function githubRequest(path, options = {}) {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body?.message || `GitHub returned ${response.status}.`;
      const help = response.status === 401
        ? " Check that the token is current and copied completely."
        : response.status === 403
          ? " Check that your GitHub account has access to the repository and the token has Contents: Read and write permission. Organisation tokens may require approval."
          : response.status === 409
            ? " The register changed after it was loaded. Reload it before saving so no colleague’s update is overwritten."
            : "";
      throw new Error(`${message}${help}`);
    }
    return body;
  }

  function decodeBase64(value) {
    const bytes = Uint8Array.from(atob(String(value || "").replace(/\s/g, "")), (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function encodeBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function parseProjectsFile(source) {
    const match = source.match(/window\.PROJECTS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!match) throw new Error(`The register file at ${DATA_PATH} does not have the expected window.PROJECTS format.`);
    const records = JSON.parse(match[1]);
    if (!Array.isArray(records)) throw new Error("The register data is not an array of project records.");
    return records.map((record) => ({ ...record }));
  }

  function serialiseProjectsFile(records) {
    return `/*\n  IS406 Project Directory data\n  -------------------------------------------------------------\n  Maintained through the integrated supervisor workspace. Do not place passwords, tokens,\n  private keys, protected documents, grades, or confidential\n  information in this public project register.\n*/\nwindow.PROJECTS = ${JSON.stringify(records, null, 2)};\n`;
  }

  function recordDisplayNumber(project) {
    const index = projects.findIndex((item) => item.id === project.id);
    return index >= 0 ? String(index + 1).padStart(2, "0") : "NEW";
  }

  function createId(name) {
    const base = String(name || "project-record")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project-record";
    let id = base;
    let number = 2;
    while (projects.some((project) => project.id === id)) {
      id = `${base}-${number}`;
      number += 1;
    }
    return id;
  }

  function renderStatusOptions() {
    const existing = adminStatusFilter.value || "all";
    adminStatusFilter.innerHTML = ["<option value=\"all\">All proposal decisions</option>", ...statuses.map((status) => `<option value="${safe(status)}">${safe(status)}</option>`)].join("");
    adminStatusFilter.value = [...adminStatusFilter.options].some((option) => option.value === existing) ? existing : "all";
  }

  function filteredProjects() {
    const query = adminSearch.value.trim().toLowerCase();
    return projects.filter((project) => {
      const searchable = [project.student, project.title, project.domain, project.status, project.summary, project.proposalStage, project.note].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) &&
        (adminStatusFilter.value === "all" || project.status === adminStatusFilter.value);
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
    adminCount.textContent = `${records.length} of ${projects.length} records`;
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
    selectedIsNew = false;
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
    const record = projects.find((item) => item.id === id);
    if (!record) return;
    selectedId = id;
    selectedIsNew = false;
    formTitle.textContent = `Edit record ${recordDisplayNumber(record)} · ${record.student}`;
    emptyForm.hidden = true;
    setFormEnabled(true);
    notice(formMessage, "");
    ["id", "student", "initials", "title", "domain", "status", "proposalStage", "summary", "note", "proposalUrl", "githubUrl", "trelloUrl", "workspaceUrl", "commitNote"].forEach((key) => setValue(key, record[key]));
    renderList();
    document.getElementById("student").focus();
  }

  function beginNewRecord() {
    selectedId = null;
    selectedIsNew = true;
    recordForm.reset();
    setValue("status", "Clarification required");
    setValue("proposalStage", "Initial project record required");
    formTitle.textContent = "Add project record";
    emptyForm.hidden = true;
    setFormEnabled(true);
    notice(formMessage, "Add the required details, then save and commit the new record.");
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

  function readFormData() {
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
    project.commitNote = String(project.commitNote || "").trim();

    const required = [["student", "Student name"], ["title", "System title"], ["domain", "System sector"], ["status", "Proposal decision"], ["proposalStage", "Project stage"], ["summary", "Proposal summary"]];
    const missing = required.find(([key]) => !project[key]);
    if (missing) throw new Error(`${missing[1]} is required.`);
    if (!statuses.includes(project.status)) throw new Error("Select a proposal decision from the available options.");
    if (!project.initials) {
      project.initials = project.student.split(/\s+/).map((part) => part[0]).join("").slice(0, 6).toUpperCase();
    }
    return project;
  }

  async function loadRegister() {
    if (!session) return;
    reloadRegisterButton.disabled = true;
    notice(formMessage, "");
    try {
      const encodedPath = DATA_PATH.split("/").map(encodeURIComponent).join("/");
      const file = await githubRequest(`/repos/${encodeURIComponent(session.owner)}/${encodeURIComponent(session.repository)}/contents/${encodedPath}?ref=${encodeURIComponent(session.branch)}`);
      if (!file.content || !file.sha) throw new Error(`GitHub did not return the ${DATA_PATH} file content.`);
      projects = parseProjectsFile(decodeBase64(file.content)).sort((a, b) => String(a.student || "").localeCompare(String(b.student || "")));
      dataSha = file.sha;
      lastLoaded.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
      clearForm();
      renderStatusOptions();
      renderList();
      notice(formMessage, "Register loaded from GitHub. Select a record to begin.", "success");
    } catch (error) {
      notice(formMessage, error.message || "The register could not be loaded.", "error");
      throw error;
    } finally {
      reloadRegisterButton.disabled = false;
    }
  }

  async function saveCurrentRecord(event) {
    event.preventDefault();
    if (!session) return;
    const saveButton = recordForm.querySelector("button[type=submit]");
    try {
      saveButton.disabled = true;
      const updated = readFormData();
      const commitNote = updated.commitNote;
      delete updated.commitNote;

      if (selectedIsNew) {
        updated.id = createId(updated.student);
        projects.push(updated);
        projects.sort((a, b) => a.student.localeCompare(b.student));
        selectedId = updated.id;
      } else {
        if (!selectedId || updated.id !== selectedId) throw new Error("The permanent record ID cannot be changed.");
        const index = projects.findIndex((project) => project.id === selectedId);
        if (index < 0) throw new Error("This project record could not be found in the loaded register.");
        projects[index] = updated;
      }

      const recordLabel = `${updated.student} — ${updated.title}`;
      const message = commitNote ? `Project register: ${commitNote}` : `Update project record: ${recordLabel}`;
      notice(formMessage, "Committing the update to GitHub…");
      const encodedPath = DATA_PATH.split("/").map(encodeURIComponent).join("/");
      const result = await githubRequest(`/repos/${encodeURIComponent(session.owner)}/${encodeURIComponent(session.repository)}/contents/${encodedPath}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          content: encodeBase64(serialiseProjectsFile(projects)),
          branch: session.branch,
          sha: dataSha
        })
      });
      dataSha = result?.content?.sha || dataSha;
      selectedIsNew = false;
      renderStatusOptions();
      renderList();
      selectRecord(selectedId);
      window.PROJECTS = projects.map((project) => ({ ...project }));
      window.dispatchEvent(new CustomEvent("fyp-projects-updated", { detail: { projects: window.PROJECTS } }));
      notice(formMessage, "Record committed to GitHub. The register shown behind this workspace has been refreshed; GitHub Pages will publish the change publicly after deployment completes.", "success");
    } catch (error) {
      notice(formMessage, error.message || "The record could not be saved. Reload the current register before trying again.", "error");
    } finally {
      saveButton.disabled = false;
    }
  }

  async function connect(event) {
    event.preventDefault();
    const owner = repoOwner.value.trim();
    const repository = repoName.value.trim();
    const branch = repoBranch.value.trim();
    const token = githubToken.value.trim();
    if (!owner || !repository || !branch || !token) {
      notice(connectMessage, "Enter the repository owner, repository name, branch, and GitHub access token.", "error");
      return;
    }
    const button = connectForm.querySelector("button[type=submit]");
    try {
      button.disabled = true;
      notice(connectMessage, "Checking GitHub access…");
      session = { owner, repository, branch, token };
      const user = await githubRequest("/user");
      repositoryLabel.textContent = `${owner}/${repository}`;
      repositoryPath.textContent = `Branch: ${branch}`;
      connectedAs.textContent = `Connected as ${user.login}`;
      connectedAs.hidden = false;
      disconnectButton.hidden = false;
      connectView.hidden = true;
      workspaceView.hidden = false;
      await loadRegister();
      githubToken.value = "";
      notice(connectMessage, "");
    } catch (error) {
      session = null;
      workspaceView.hidden = true;
      connectView.hidden = false;
      connectedAs.hidden = true;
      disconnectButton.hidden = true;
      notice(connectMessage, error.message || "GitHub could not verify this connection.", "error");
    } finally {
      button.disabled = false;
    }
  }

  function disconnect(showMessage = true) {
    session = null;
    projects = [];
    selectedId = null;
    selectedIsNew = false;
    dataSha = null;
    workspaceView.hidden = true;
    connectView.hidden = false;
    connectedAs.hidden = true;
    disconnectButton.hidden = true;
    connectForm.reset();
    initialiseConnectionFields();
    clearForm();
    notice(connectMessage, showMessage ? "Disconnected. The GitHub access token has been removed from this browser tab." : "", showMessage ? "success" : "");
  }

  function openWorkspace() {
    if (typeof supervisorDialog.showModal === "function") supervisorDialog.showModal();
    else supervisorDialog.setAttribute("open", "");
    window.setTimeout(() => githubToken.focus(), 0);
  }

  function closeWorkspace() {
    disconnect(false);
    if (supervisorDialog.open && typeof supervisorDialog.close === "function") supervisorDialog.close();
    else supervisorDialog.removeAttribute("open");
    openSupervisorWorkspace.focus();
  }

  connectForm.addEventListener("submit", connect);
  disconnectButton.addEventListener("click", () => disconnect(true));
  openSupervisorWorkspace.addEventListener("click", openWorkspace);
  closeSupervisorWorkspace.addEventListener("click", closeWorkspace);
  supervisorDialog.addEventListener("click", (event) => { if (event.target === supervisorDialog) closeWorkspace(); });
  supervisorDialog.addEventListener("close", () => { if (session) disconnect(false); });
  reloadRegisterButton.addEventListener("click", () => loadRegister().catch(() => {}));
  adminSearch.addEventListener("input", renderList);
  adminStatusFilter.addEventListener("change", renderList);
  newRecordButton.addEventListener("click", beginNewRecord);
  recordForm.addEventListener("submit", saveCurrentRecord);
  resetFormButton.addEventListener("click", () => {
    if (selectedIsNew) beginNewRecord();
    else if (selectedId) selectRecord(selectedId);
  });

  initialiseConnectionFields();
  renderStatusOptions();
  setFormEnabled(false);
})();
