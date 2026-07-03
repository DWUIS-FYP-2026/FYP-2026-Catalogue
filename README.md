# IS406 Final Year Project Register

A GitHub Pages–ready academic register for the 2026 IS406 final-year project cohort. The public register is a read-only directory of students, proposed systems, proposal decisions, project summaries, and checked project-evidence links.

The package also includes a **supervisor administration panel** at `admin.html`. It uses Firebase Authentication for supervisor sign-in and Cloud Firestore for shared project-record updates. The staff workspace is deliberately a project record editor—not a generic dashboard.

## Publish the public register on GitHub Pages

1. Create a GitHub repository, for example `is406-final-year-project-register`.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main`, select `/ (root)`, then save.
5. GitHub will provide the public website address after deployment.

The public website works immediately using the supplied project records. It becomes a live shared register when Firebase is configured and the initial records are published from the administration page.

## Enable supervisor login and shared updates

Read **[SUPERVISOR_ADMIN_SETUP.md](SUPERVISOR_ADMIN_SETUP.md)** before inviting supervisors. It explains how to:

- connect the site to Firebase in `assets/firebase-config.js`;
- enable email/password sign-in;
- create supervisor accounts and give them an active `supervisors/{UID}` role record;
- publish the supplied `firestore.rules` access controls;
- seed the current 25 student records into the shared project collection.

## Project record fields

Each project record contains:

- `student` and `initials`;
- `title`, `summary`, `domain`, `status`, `proposalStage`, and `note`;
- `proposalUrl`, `githubUrl`, `trelloUrl`, and `workspaceUrl`.

Use the supervisor page to edit shared records after Firebase is configured. The static `assets/projects.js` file remains the initial/public fallback data source.

Do not publish passwords, access tokens, private keys, protected reports, student grades, personal contact details, or confidential project material.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Public student project register |
| `admin.html` | Supervisor-only sign-in and project editor |
| `assets/firebase-config.js` | Firebase web-app settings to complete |
| `assets/firebase-service.js` | Shared auth and Firestore integration |
| `firestore.rules` | Firestore access-control rules |
| `SUPERVISOR_ADMIN_SETUP.md` | Secure setup guide |
