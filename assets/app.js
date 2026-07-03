(() => {
  const baseProjects = Array.isArray(window.PROJECTS) ? window.PROJECTS.map((project) => ({ ...project })) : [];
  let projects = [...baseProjects];
  const LIVE_SYNC_KEY = "is406-project-register-live-sync";
  const LIVE_SYNC_TTL_MS = 15 * 60 * 1000;
  const liveChannel = "BroadcastChannel" in window ? new BroadcastChannel("is406-project-register") : null;
  const rows = document.getElementById("projectRows");
  const rowTemplate = document.getElementById("projectRowTemplate");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const domainFilter = document.getElementById("domainFilter");
  const clearButton = document.getElementById("clearFilters");
  const emptyClear = document.getElementById("emptyClear");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const summaryList = document.getElementById("summaryList");
  const headerRecordCount = document.getElementById("headerRecordCount");
  const dialog = document.getElementById("projectDialog");
  const dialogContent = document.getElementById("dialogContent");
  const closeDialog = document.getElementById("closeDialog");
  const registerDataStatus = document.getElementById("registerDataStatus");

  const safe = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));

  const resourcesFor = (project) => [
    { label: "Project proposal", value: project.proposalUrl, type: "Proposal" },
    { label: "GitHub repository", value: project.githubUrl, type: "GitHub" },
    { label: "Trello board", value: project.trelloUrl, type: "Trello" },
    { label: "Working directory", value: project.workspaceUrl, type: "Workspace" }
  ];

  const linkedCount = (project) => resourcesFor(project).filter((resource) => Boolean(resource.value)).length;
  const statusClass = (status) => `status-${String(status).toLowerCase().replaceAll("·", "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`;
  const profileFor = (project) => {
    if (project.status === "New topic required") return "Final-year Information Systems student awaiting a confirmed project topic.";
    return `Final-year Information Systems student developing a ${String(project.domain || "project").toLowerCase()} system.`;
  };

  function mergeRemoteProjects(remoteRecords) {
    const remoteById = new Map(remoteRecords.map((project) => [project.id, project]));
    const combined = baseProjects.map((project) => ({ ...project, ...(remoteById.get(project.id) || {}) }));
    remoteRecords.forEach((project) => {
      if (!baseProjects.some((base) => base.id === project.id)) combined.push(project);
    });
    return combined.sort((a, b) => a.student.localeCompare(b.student));
  }

  function populateDomains() {
    const currentValue = domainFilter.value;
    domainFilter.innerHTML = '<option value="all">All sectors</option>';
    [...new Set(projects.map((project) => project.domain).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .forEach((domain) => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        domainFilter.appendChild(option);
      });
    domainFilter.value = [...domainFilter.options].some((option) => option.value === currentValue) ? currentValue : "all";
  }

  function renderSummary() {
    const approved = projects.filter((project) => ["Approved", "Approved · scope confirmation"].includes(project.status)).length;
    const clarification = projects.filter((project) => project.status === "Clarification required").length;
    const action = projects.filter((project) => ["Reassigned", "New topic required"].includes(project.status)).length;
    const linked = projects.reduce((total, project) => total + linkedCount(project), 0);
    const summary = [
      ["Student records", projects.length],
      ["Approved or progressing", approved],
      ["Scope clarification", clarification],
      ["Topic actions", action],
      ["Evidence links live", linked]
    ];
    summaryList.innerHTML = summary.map(([label, value]) => `<div class="summary-row"><dt>${safe(label)}</dt><dd>${value}</dd></div>`).join("");
    headerRecordCount.textContent = `${projects.length} records`;
  }

  function filteredProjects() {
    const query = searchInput.value.trim().toLowerCase();
    return projects.filter((project) => {
      const searchable = [project.student, project.title, project.summary, project.domain, project.status, project.note, project.proposalStage]
        .join(" ").toLowerCase();
      return (!query || searchable.includes(query)) &&
        (statusFilter.value === "all" || project.status === statusFilter.value) &&
        (domainFilter.value === "all" || project.domain === domainFilter.value);
    });
  }

  function renderRows() {
    const list = filteredProjects();
    rows.innerHTML = "";
    list.forEach((project) => {
      const recordNo = projects.indexOf(project) + 1;
      const fragment = rowTemplate.content.cloneNode(true);
      const row = fragment.querySelector("tr");
      const opens = fragment.querySelectorAll(".student-link, .system-link, .open-record");
      const evidence = linkedCount(project);

      row.querySelector(".record-number").textContent = String(recordNo).padStart(2, "0");
      row.querySelector(".student-name").textContent = project.student;
      row.querySelector(".student-bio").textContent = profileFor(project);
      row.querySelector(".project-title").textContent = project.title;
      row.querySelector(".project-summary").textContent = project.summary;
      row.querySelector(".project-domain").textContent = project.domain;
      const status = row.querySelector(".status-label");
      status.textContent = project.status;
      status.classList.add(statusClass(project.status));
      const evidenceCell = row.querySelector(".evidence-count");
      evidenceCell.textContent = `${evidence}/4 linked`;
      evidenceCell.classList.toggle("has-links", evidence > 0);
      opens.forEach((button) => button.addEventListener("click", () => openRecord(project, recordNo)));
      rows.appendChild(fragment);
    });

    resultCount.textContent = `${list.length} of ${projects.length} records shown`;
    emptyState.hidden = list.length !== 0;
  }

  function resourceRow(resource) {
    if (resource.value) {
      return `<tr><td>${safe(resource.label)}</td><td class="resource-published"><a href="${safe(resource.value)}" target="_blank" rel="noopener noreferrer">Open link ↗</a></td></tr>`;
    }
    return `<tr><td>${safe(resource.label)}</td><td class="resource-pending">Pending publication</td></tr>`;
  }

  function openRecord(project, recordNo) {
    const linked = linkedCount(project);
    dialogContent.innerHTML = `
      <section class="record-head">
        <div class="record-number-large" aria-label="Record ${recordNo}">${String(recordNo).padStart(2, "0")}</div>
        <div>
          <p class="record-person">${safe(project.student)}</p>
          <p class="record-bio">${safe(profileFor(project))}</p>
          <h2 id="dialogTitle">${safe(project.title)}</h2>
          <div class="record-status-line">
            <strong class="${statusClass(project.status)}">${safe(project.status)}</strong>
            <span>${safe(project.domain)}</span>
          </div>
        </div>
      </section>
      <div class="record-sections">
        <section class="record-section">
          <h3>System proposal</h3>
          <p>${safe(project.summary)}</p>
        </section>
        <section class="record-section record-grid">
          <div>
            <p class="data-label">Current project stage</p>
            <p class="data-value">${safe(project.proposalStage)}</p>
          </div>
          <div>
            <p class="data-label">Project direction</p>
            <p class="data-value">${safe(project.note)}</p>
          </div>
        </section>
        <section class="record-section">
          <h3>Evidence register</h3>
          <table class="resource-register">
            <thead><tr><th scope="col">Project resource</th><th scope="col">Availability</th></tr></thead>
            <tbody>${resourcesFor(project).map(resourceRow).join("")}</tbody>
          </table>
          <p class="dialog-note">${linked} of 4 project resources are linked in this record. Links should be viewable by the supervisor and should not include private access credentials.</p>
        </section>
      </div>`;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeRecord() {
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function clearFilters() {
    searchInput.value = "";
    statusFilter.value = "all";
    domainFilter.value = "all";
    renderRows();
    searchInput.focus();
  }

  function rerender() {
    populateDomains();
    renderSummary();
    renderRows();
  }

  function normaliseProjects(records) {
    return records
      .map((project) => ({ ...project }))
      .sort((a, b) => String(a.student || "").localeCompare(String(b.student || "")));
  }

  function applyWorkspaceUpdate(records) {
    if (!Array.isArray(records)) return;
    projects = normaliseProjects(records);
    window.PROJECTS = projects.map((project) => ({ ...project }));
    rerender();
  }

  function publishWorkspaceUpdate(records, changedId = "") {
    const payload = {
      records: records.map((project) => ({ ...project })),
      changedId,
      savedAt: Date.now()
    };
    try {
      window.localStorage.setItem(LIVE_SYNC_KEY, JSON.stringify(payload));
    } catch (_) {
      // Local storage can be unavailable in some private browsing configurations.
    }
    try {
      liveChannel?.postMessage(payload);
    } catch (_) {
      // The current page still receives the immediate in-page update.
    }
  }

  function recentWorkspaceUpdate() {
    try {
      const raw = window.localStorage.getItem(LIVE_SYNC_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!Array.isArray(payload.records) || !Number.isFinite(payload.savedAt)) return null;
      if (Date.now() - payload.savedAt > LIVE_SYNC_TTL_MS) {
        window.localStorage.removeItem(LIVE_SYNC_KEY);
        return null;
      }
      return payload;
    } catch (_) {
      return null;
    }
  }

  function showRecordFromRegister(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return false;
    clearFilters();
    const recordNo = projects.indexOf(project) + 1;
    openRecord(project, recordNo);
    return true;
  }

  window.IS406ProjectRegister = {
    replaceRecords(records, options = {}) {
      applyWorkspaceUpdate(records);
      if (options.publish) publishWorkspaceUpdate(records, options.changedId || "");
    },
    showRecord(id) {
      return showRecordFromRegister(id);
    },
    getRecords() {
      return projects.map((project) => ({ ...project }));
    }
  };

  searchInput.addEventListener("input", renderRows);
  statusFilter.addEventListener("change", renderRows);
  domainFilter.addEventListener("change", renderRows);
  clearButton.addEventListener("click", clearFilters);
  emptyClear.addEventListener("click", clearFilters);
  closeDialog.addEventListener("click", closeRecord);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeRecord(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && dialog.open) closeRecord(); });

  window.addEventListener("fyp-projects-updated", (event) => {
    const updatedRecords = event?.detail?.projects;
    if (!Array.isArray(updatedRecords)) return;
    applyWorkspaceUpdate(updatedRecords);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== LIVE_SYNC_KEY || !event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue);
      if (Array.isArray(payload.records)) applyWorkspaceUpdate(payload.records);
    } catch (_) {
      // Ignore malformed browser storage data.
    }
  });

  if (liveChannel) {
    liveChannel.addEventListener("message", (event) => {
      const payload = event?.data;
      if (Array.isArray(payload?.records)) applyWorkspaceUpdate(payload.records);
    });
  }

  const pendingUpdate = recentWorkspaceUpdate();
  if (pendingUpdate) applyWorkspaceUpdate(pendingUpdate.records);
  else rerender();

  registerDataStatus.textContent = "Published register · maintained through the supervisor workspace";

})();
