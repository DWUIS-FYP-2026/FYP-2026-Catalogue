# IS406 Final Year Project Directory

A polished, static website designed for publishing the IS406 final-year project cohort on **GitHub Pages**.

It provides:

- A responsive directory of 25 student project records
- Proposal status and project direction notes based on the supplied project-feedback records
- Search and filters by student, project, status and system domain
- A project detail view with live resource slots for the proposal, GitHub repository, Trello board and working directory
- Light/dark display modes
- No build process, database or server required

## Publish on GitHub Pages

1. Create a new GitHub repository, for example: `is406-final-year-projects`.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder, then save.
6. GitHub will provide the published website address.

## Add student links

Open `assets/projects.js` and find the correct student record. Replace the empty values with real, viewable URLs:

```js
proposalUrl: "https://...",
githubUrl: "https://github.com/...",
trelloUrl: "https://trello.com/b/...",
workspaceUrl: "https://..."
```

Leave an entry empty (`""`) until the student has supplied a valid link. The website will then show **Pending** instead of publishing a broken link.

Do not add passwords, private credentials, or URLs that expose confidential student or client information.

## Source notes

The initial project titles, summaries, and proposal directions were compiled from the supplied IS406 project-feedback documents. Reassigned and conditional projects are labelled accordingly so the directory remains accurate as each student confirms their final scope.
