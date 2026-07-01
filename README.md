# IS406 Final Year Project Register

A static, GitHub Pages-ready register for the 2026 IS406 final-year project cohort. It is designed as an academic record directory rather than a dashboard. The main register lists each student, proposed system, sector, proposal decision, and current evidence-link count.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `is406-final-year-project-register`.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main`, select `/ (root)`, then save.
5. GitHub will provide the public website address after deployment.

## Update project information

Project data is in `assets/projects.js`. Each student record contains:

- `student` and `initials`
- `title`, `summary`, and `domain`
- `status`, `proposalStage`, and `note`
- `proposalUrl`, `githubUrl`, `trelloUrl`, and `workspaceUrl`

Leave an URL field empty until a valid, viewable link has been supplied. Do not add passwords, access tokens, student credentials, or links to confidential information.

## Design approach

The interface uses a dense, searchable register with a record-detail view. It avoids decorative dashboards, analytics, generic cards, gradients, and inflated statistics. Status colour is used only to distinguish project decisions, while the resource register shows whether each required evidence link is available.
