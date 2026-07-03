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
4. Enter the token, select a project record, update the required fields, then select **Save and commit record**.
5. Close the workspace when finished. The token is removed from the browser tab.

Read [GITHUB_SUPERVISOR_WORKSPACE.md](GITHUB_SUPERVISOR_WORKSPACE.md) before inviting supervisors. It covers permissions, token setup, protected branches, and safeguards.

## Project record fields

Each project record contains:

- `student` and `initials`;
- `title`, `summary`, `domain`, `status`, `proposalStage`, and `note`;
- `proposalUrl`, `githubUrl`, `trelloUrl`, and `workspaceUrl`.

The authoritative public data stays in `assets/projects.js`. The integrated supervisor workspace changes it through a controlled form and records every update in GitHub commit history.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Public register and the integrated supervisor workspace |
| `assets/projects.js` | Public project register data |
| `assets/repository-config.js` | Public repository, branch, and data-file settings |
| `assets/supervisor-workspace.js` | GitHub-backed supervisor editor used within the public page |
| `GITHUB_SUPERVISOR_WORKSPACE.md` | Setup and operating guide |

Do not publish passwords, access tokens, private keys, protected reports, student grades, personal contact details, or confidential project material.
