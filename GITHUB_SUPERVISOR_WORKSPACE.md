# Supervisor Workspace: GitHub Repository Setup

The integrated supervisor workspace opened from **Supervisor sign in** on `index.html` is a structured editor for the public project register. Supervisors use form fields to update student records; the page writes the updated `assets/projects.js` file back to this repository as a normal GitHub commit.

No separate database or website password is used.

## One-time repository preparation

1. Keep the public website files in the repository root.
2. Ensure the register is published from the `main` branch through GitHub Pages.
3. Invite each authorised supervisor to the repository or an organisation team with permission to push to `main`.
4. If `main` is protected, allow the appropriate team to push directly, or change the workflow to a pull-request process before use.

## Each supervisor: create a restricted GitHub token

Each supervisor must create their own **fine-grained personal access token** in GitHub:

1. Open GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Create a token such as `IS406 Project Register Workspace`.
3. Set the resource owner to the correct organisation or account.
4. Restrict repository access to **Only select repositories**, then select the register repository.
5. Under Repository permissions, set **Contents** to **Read and write**.
6. Use a short expiry appropriate to the semester or supervision period.
7. Copy the token once and keep it private. GitHub will not show it again.

An organisation may require an owner to approve a fine-grained token before it can access the organisation repository.

## Manage project records through the interface

1. Open the published project register and select **Supervisor sign in**.
2. Confirm the repository owner, repository, and branch shown in the connection form.
3. Paste your personal token and select **Connect to register**.
4. Choose one of the following actions:
   - **Add project record** to create a new student project. Complete the required student, project, decision, stage, summary, and link fields.
   - **Edit record** beside an existing entry to update its details, project stage, decision, or evidence links.
   - **Remove record** only for a duplicate, withdrawn, or incorrectly created record. Type `DELETE` in the confirmation field, then select **Delete permanently**.
5. Optionally add a short commit note.
6. Select **Save and commit record** for an addition or update.
7. Wait for the success message. The public GitHub Pages site will reflect the committed change after its normal deployment completes.

The workspace prevents duplicate student names and preserves the permanent record ID when an existing project is updated. It does not permanently erase history: GitHub retains the prior version in the repository commit history.

## Operational safeguards

- The token is only kept in the active browser tab. It is never written to the repository, local storage, or the public page source.
- The workspace checks the current file revision when saving. If another supervisor updates the register first, reload the current register before saving yours.
- GitHub records the account responsible for each commit in the repository history.
- Do not add passwords, access tokens, private links, protected documents, grades, student phone numbers, medical information, or any other confidential material.
- Record removal requires a deliberate `DELETE` confirmation. Use it only for a duplicate, withdrawn, or incorrectly created record; update a record instead when the project title, scope, or status has simply changed.
- GitHub commit history preserves a recoverable version of the register before each removal. Use repository history to restore a record if necessary.

## Repository configuration

The public settings in `assets/repository-config.js` identify the repository and branch used by default. They do not contain secret credentials. Update the file only if the repository is moved, renamed, or uses a different publishing branch.
