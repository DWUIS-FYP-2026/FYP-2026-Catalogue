# IS406 Final Year Project Register

A GitHub Pages–ready academic register for the 2026 IS406 final-year project cohort. The public register is a read-only directory of students, proposed systems, proposal decisions, project summaries, and checked project-evidence links.

## One integrated website

The **Supervisor sign in** control in the top-right corner of `index.html` opens the supervisor workspace inside the same website. Supervisors update records using the form interface; they do not edit `assets/projects.js` directly and do not use a separate database or a separate administration page.

The workspace writes the updated register data to the repository as a normal GitHub commit. The public table refreshes immediately in that supervisor’s browser, and GitHub Pages publishes the change after its normal deployment finishes.

## Publish on GitHub Pages

1. Create or open the GitHub repository for the register.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main`, choose `/ (root)`, then save.
5. GitHub provides the public website address after the deployment finishes.

## Use the integrated supervisor workspace

1. Give each authorised supervisor write access to this repository.
2. Each supervisor creates a restricted GitHub fine-grained personal access token for this repository only, with **Contents: Read and write** permission.
3. Open the published register and select **Supervisor sign in**.
4. Select **Add new project record** to create a project, or select an existing record to review and update it.
5. Select **Save and commit record** to publish an addition or update. To remove an incorrect, duplicate, or withdrawn record, use **Remove record**, type `DELETE`, then confirm.
6. Close the workspace when finished. The token is removed from the browser tab.

Read [GITHUB_SUPERVISOR_WORKSPACE.md](GITHUB_SUPERVISOR_WORKSPACE.md) before inviting supervisors. It covers permissions, token setup, protected branches, and safeguards.

## Project record fields

Each project record contains:

- `student` and `initials`;
- `title`, `summary`, `domain`, `status`, `proposalStage`, and `note`;
- `proposalUrl`, `githubUrl`, `trelloUrl`, and `workspaceUrl`.

The authoritative public data stays in `assets/projects.js`. The integrated supervisor workspace provides controlled create, read, update, and delete actions through forms and records every committed change in GitHub history.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Public register and the integrated supervisor workspace |
| `assets/projects.js` | Public project register data |
| `assets/repository-config.js` | Public repository, branch, and data-file settings |
| `assets/supervisor-workspace.js` | GitHub-backed supervisor editor used within the public page |
| `GITHUB_SUPERVISOR_WORKSPACE.md` | Setup and operating guide |

Do not publish passwords, access tokens, private keys, protected reports, student grades, personal contact details, or confidential project material.


## Immediate main-register sync

After a supervisor saves, adds, or removes a record, the main project register in the same browser updates immediately. The supervisor workspace now shows **View updated record in main register** so the updated entry can be checked without waiting for a full page reload. Other open tabs in the same browser are also updated.

Visitors on other devices receive the changed file after GitHub Pages completes its deployment; this normally requires a short delay, then a normal browser refresh.


## Verified evidence-link publishing
This version reads the saved project file back from GitHub after every supervisor change and verifies the four evidence-link fields before refreshing the public record. See `VERIFIED_REGISTER_SYNC.md`.
