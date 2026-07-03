# Project Link Update Guide

Supervisors update project links from **`admin.html`** after Firebase supervisor access has been configured. This keeps the public register and supervisor records synchronized.

Each record can hold four checked evidence links:

1. **Project proposal** — approved proposal, agreed shared folder, or document location.
2. **GitHub repository** — the development repository shared with the supervisor.
3. **Trello board** — the project planning board showing current work.
4. **Working directory** — the approved folder for forms, designs, testing evidence, and final deliverables.

## Link standard

- Use complete `https://` links only.
- Verify that the required staff can open the link before publishing it.
- Leave a link blank until it is ready to publish.
- Do not publish passwords, sharing tokens, private credentials, personal student records, grades, or confidential materials.

## Before Firebase is configured

The starting records are kept in `assets/projects.js`. They are published into the shared Firestore register when an authorised supervisor uses the **Publish supplied records** button in `admin.html`.
