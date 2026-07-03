# IS406 Final Year Project Register

A GitHub Pages–ready academic register for the 2026 IS406 final-year project cohort. The public register is a read-only directory of students, proposed systems, proposal decisions, project summaries, and checked project-evidence links.

The package includes a **supervisor workspace** at `admin.html`. It is a structured form interface that loads and commits `assets/projects.js` directly to the GitHub repository. It does **not** use a separate database service.

## Publish on GitHub Pages

1. Create or open the GitHub repository for the register.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main`, choose `/ (root)`, then save.
5. GitHub provides the public website address after the deployment finishes.

## Use the supervisor workspace

1. Give each authorised supervisor access to this repository.
2. Each supervisor creates a restricted GitHub fine-grained personal access token for this repository only, with **Contents: Read and write** permission.
3. Open `admin.html` from the published website.
4. Connect using the repository details and the temporary GitHub token.
5. Select a student project record, update it using the form, and choose **Save and commit record**.

Read [GITHUB_SUPERVISOR_WORKSPACE.md](GITHUB_SUPERVISOR_WORKSPACE.md) before inviting supervisors. It covers permissions, token setup, protected branches, and safeguards.

## Project record fields

Each project record contains:

- `student` and `initials`;
- `title`, `summary`, `domain`, `status`, `proposalStage`, and `note`;
- `proposalUrl`, `githubUrl`, `trelloUrl`, and `workspaceUrl`.

The authoritative public data stays in `assets/projects.js`. The supervisor page changes it through the form interface and records every update in GitHub commit history.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Public student project register |
| `admin.html` | Supervisor form workspace that commits project updates to GitHub |
| `assets/projects.js` | Public project register data |
| `assets/repository-config.js` | Public default repository, branch, and data-file settings |
| `assets/admin.js` | GitHub-backed supervisor editor |
| `GITHUB_SUPERVISOR_WORKSPACE.md` | Setup and operating guide |

Do not publish passwords, access tokens, private keys, protected reports, student grades, personal contact details, or confidential project material.
