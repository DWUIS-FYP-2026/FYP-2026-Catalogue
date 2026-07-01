# Project Link Update Guide

The project register shows four evidence links for every student record:

1. **Project proposal** — approved proposal, agreed shared folder, or document location.
2. **GitHub repository** — the development repository shared with the supervisor.
3. **Trello board** — the project planning board showing current work.
4. **Working directory** — the approved folder for forms, designs, testing evidence, and final deliverables.

## Where to update links

Open `assets/projects.js` and find the student record. Replace the empty strings only after confirming the URL is viewable by the required staff.

```js
proposalUrl: "https://...",
githubUrl: "https://github.com/...",
trelloUrl: "https://trello.com/b/...",
workspaceUrl: "https://..."
```

Use empty strings for unavailable links:

```js
proposalUrl: "", githubUrl: "", trelloUrl: "", workspaceUrl: ""
```

Do not publish passwords, sharing tokens, private credentials, student identification records, or confidential project material.
