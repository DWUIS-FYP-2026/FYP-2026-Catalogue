(function () {
  "use strict";

  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const grid = document.getElementById("projectGrid");
  const template = document.getElementById("projectCardTemplate");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const domainFilter = document.getElementById("domainFilter");
  const clearButton = document.getElementById("clearFilters");
  const emptyClear = document.getElementById("emptyClear");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const statGrid = document.getElementById("statGrid");
  const dialog = document.getElementById("projectDialog");
  const dialogContent = document.getElementById("dialogContent");
  const closeDialog = document.getElementById("closeDialog");
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = themeToggle.querySelector(".theme-label");

  const icon = (name) => ({
    document: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 2.75h7.4L18.5 7v14.25H6.5z"></path><path d="M13.5 2.75V7h5"></path><path d="M9 11h6M9 15h6M9 19h4"></path></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.3a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.61-3.36-1.18-3.36-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.54 1.04 1.54 1.04.9 1.54 2.35 1.1 2.92.84.09-.65.35-1.1.64-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.28.1-2.67 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0 1 12 6.45c.85 0 1.7.11 2.5.34 1.9-1.3 2.74-1.03 2.74-1.03.55 1.39.2 2.42.1 2.67.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.91.68 1.84v2.72c0 .27.18.58.69.48A10 10 0 0 0 12 2.3Z"></path></svg>',
    trello: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5"></rect><rect x="6.5" y="6.5" width="4.5" height="8" rx=".7"></rect><rect x="13" y="6.5" width="4.5" height="12" rx=".7"></rect></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h6l1.6 2H21v9.75A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25z"></path><path d="M3 8.5h18"></path></svg>'
  }[name]);

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function linksFor(project) {
    return [
      { label: "Proposal", icon: "document", url: project.proposalUrl },
      { label: "GitHub", icon: "github", url: project.githubUrl },
      { label: "Trello", icon: "trello", url: project.trelloUrl },
      { label: "Workspace", icon: "folder", url: project.workspaceUrl }
    ];
  }

  function linkedCount(project) {
    return linksFor(project).filter((item) => Boolean(item.url)).length;
  }

  function renderStats() {
    const approved = projects.filter((p) => p.status === "Approved" || p.status === "Approved · scope confirmation").length;
    const clarification = projects.filter((p) => p.status === "Clarification required").length;
    const reassigned = projects.filter((p) => p.status === "Reassigned").length;
    const newTopics = projects.filter((p) => p.status === "New topic required").length;

    document.getElementById("heroTotal").textContent = projects.length;
    document.getElementById("heroApproved").textContent = approved;
    document.getElementById("heroAction").textContent = projects.length - approved;

    const stats = [
      { number: projects.length, label: "Student records", description: "current cohort directory" },
      { number: approved, label: "Approved projects", description: "including scope-confirmation items" },
      { number: clarification, label: "Clarification required", description: "research or scope response needed" },
      { number: reassigned + newTopics, label: "Topic actions", description: "reassigned or awaiting a new topic" }
    ];

    statGrid.innerHTML = stats.map((item) => `
      <article class="stat-card">
        <strong>${item.number}</strong>
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.description)}</small>
      </article>`).join("");
  }

  function populateDomains() {
    const domains = [...new Set(projects.map((p) => p.domain))].sort((a, b) => a.localeCompare(b));
    domains.forEach((domain) => {
      const option = document.createElement("option");
      option.value = domain;
      option.textContent = domain;
      domainFilter.appendChild(option);
    });
  }

  function filteredProjects() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const status = statusFilter.value;
    const domain = domainFilter.value;

    return projects.filter((project) => {
      const haystack = [project.student, project.title, project.summary, project.domain, project.status, project.note]
        .join(" ").toLocaleLowerCase();
      return (!query || haystack.includes(query)) &&
        (status === "all" || project.status === status) &&
        (domain === "all" || project.domain === domain);
    });
  }

  function renderProjects() {
    const list = filteredProjects();
    grid.innerHTML = "";
    list.forEach((project) => {
      const item = template.content.cloneNode(true);
      const card = item.querySelector(".project-card");
      card.dataset.projectId = project.id;
      item.querySelector(".status-badge").textContent = project.status;
      item.querySelector(".status-badge").classList.add(statusClass(project.status));
      item.querySelector(".project-domain").textContent = project.domain;
      item.querySelector(".student-name").textContent = project.student;
      item.querySelector(".project-title").textContent = project.title;
      item.querySelector(".project-summary").textContent = project.summary;
      const count = linkedCount(project);
      item.querySelector(".resource-text").textContent = count ? `${count} of 4 resources linked` : "Project links pending";
      item.querySelector(".resource-dot").classList.toggle("linked", count > 0);
      item.querySelector(".project-open").addEventListener("click", () => openProject(project));
      grid.appendChild(item);
    });

    resultCount.textContent = `${list.length} ${list.length === 1 ? "project" : "projects"} shown`;
    emptyState.hidden = list.length !== 0;
  }

  function statusClass(status) {
    return `status-${status.toLowerCase().replaceAll("·", "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`;
  }

  function actionLink(resource) {
    if (resource.url) {
      return `<a class="resource-link resource-live" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">${icon(resource.icon)}<span>${escapeHtml(resource.label)}</span><small>Open ↗</small></a>`;
    }
    return `<span class="resource-link resource-pending" title="Link not yet supplied">${icon(resource.icon)}<span>${escapeHtml(resource.label)}</span><small>Pending</small></span>`;
  }

  function studentProfile(project) {
    if (project.status === "New topic required") return "Final-year Information Systems student awaiting confirmation of a new project topic.";
    return `Final-year Information Systems student · Project focus: ${project.domain}.`;
  }

  function openProject(project) {
    const linked = linkedCount(project);
    dialogContent.innerHTML = `
      <div class="dialog-hero">
        <div class="avatar" aria-hidden="true">${escapeHtml(project.initials)}</div>
        <div>
          <p class="dialog-student">${escapeHtml(project.student)}</p>
          <p class="dialog-bio">${escapeHtml(studentProfile(project))}</p>
          <h2 id="dialogTitle">${escapeHtml(project.title)}</h2>
          <div class="dialog-tags"><span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span><span>${escapeHtml(project.domain)}</span></div>
        </div>
      </div>
      <div class="dialog-grid">
        <section>
          <p class="detail-kicker">System proposal</p>
          <p class="detail-copy">${escapeHtml(project.summary)}</p>
        </section>
        <section>
          <p class="detail-kicker">Current stage</p>
          <p class="detail-copy">${escapeHtml(project.proposalStage)}</p>
        </section>
      </div>
      <section class="project-note">
        <p class="detail-kicker">Project direction</p>
        <p>${escapeHtml(project.note)}</p>
      </section>
      <section class="resources-section" aria-label="Project resources">
        <div class="resources-heading"><div><p class="detail-kicker">Project resources</p><p>Link status: <strong>${linked} of 4 available</strong></p></div></div>
        <div class="resource-grid">${linksFor(project).map(actionLink).join("")}</div>
      </section>
      <p class="dialog-helper">Links are published only after a student supplies an approved, viewable URL. Do not publish passwords, student credentials or private access keys.</p>`;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeProject() {
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function clearFilters() {
    searchInput.value = "";
    statusFilter.value = "all";
    domainFilter.value = "all";
    renderProjects();
    searchInput.focus();
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("is406-project-directory-theme", theme);
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }

  const savedTheme = localStorage.getItem("is406-project-directory-theme");
  if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  else setTheme(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  searchInput.addEventListener("input", renderProjects);
  statusFilter.addEventListener("change", renderProjects);
  domainFilter.addEventListener("change", renderProjects);
  clearButton.addEventListener("click", clearFilters);
  emptyClear.addEventListener("click", clearFilters);
  closeDialog.addEventListener("click", closeProject);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeProject(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && dialog.open) closeProject(); });

  populateDomains();
  renderStats();
  renderProjects();
})();
