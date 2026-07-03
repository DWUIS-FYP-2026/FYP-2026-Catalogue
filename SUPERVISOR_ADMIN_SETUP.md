# Supervisor Administration Setup

This project is a **GitHub Pages website with a secure shared administration area**. The public register is read-only. Supervisors sign in using Firebase Authentication, and approved supervisor accounts can update records in Cloud Firestore.

The Firebase configuration object is public by design; database access is protected by the **Firestore Security Rules** in this folder. Do not rely on a hidden API key for security.

## 1. Create the Firebase services

1. Create a Firebase project.
2. Add a **Web app** to the project. Copy its Firebase configuration object.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. In **Firestore Database**, create a Cloud Firestore database in production mode.
5. In **Firestore Database → Rules**, replace the rules with the contents of `firestore.rules` in this project, then publish the rules.

## 2. Connect this GitHub Pages site

Open `assets/firebase-config.js` and replace the blank values with the Firebase configuration values supplied when the Web app was registered.

```js
window.FYP_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Commit and publish this change with the rest of the website. The configuration object is not a password. The Firestore rules—not the client configuration—protect the data.

## 3. Create each supervisor account and role

For each supervisor:

1. In **Authentication → Users**, select **Add user** and create their email/password account.
2. Copy that user’s **UID**.
3. In **Firestore Database → Data**, create a document in the `supervisors` collection whose **Document ID is exactly the user’s UID**.
4. Give it these fields:

| Field | Type | Example |
|---|---|---|
| `name` | string | `Dr Jane Doe` |
| `active` | boolean | `true` |
| `role` | string | `Supervisor` |

A signed-in Firebase user without this active supervisor document cannot access the editor or save records.

## 4. Publish the starting register

1. Open `admin.html` on the published site.
2. Sign in with an authorised supervisor account.
3. Select **Publish supplied records**.

This creates the 25 current student records in Firestore. After this, public visitors see live shared updates in `index.html` and supervisors can edit records through `admin.html`.

## 5. Operational safeguards

- The public `projects` collection must contain only details that are appropriate to publish.
- Never place student passwords, access tokens, private share links, protected reports, medical information, grades, personal phone numbers, or other confidential material in the project records.
- Check every proposal, GitHub, Trello, and workspace link before publishing it.
- The supplied security rules make project records non-deletable through the web app. This prevents accidental removal of a student record.
- Audit entries are created when records are seeded or updated. The Firestore console retains the authoritative data history.

## What the administrator maintains

| Location | Purpose |
|---|---|
| `assets/firebase-config.js` | Firebase web-app connection settings |
| Firebase Authentication | Supervisor login accounts |
| Firestore `supervisors` | Which authenticated users can edit |
| Firestore `projects` | Shared project register records |
| Firestore `project_audit` | Append-only update log |
| `firestore.rules` | Access control for public and supervisor activity |
