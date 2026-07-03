# Supervisor Workspace: GitHub Repository Setup

The supervisor workspace in `admin.html` is a structured editor for the public project register. Supervisors use form fields to update student records; the page writes the updated `assets/projects.js` file back to this repository as a normal GitHub commit.

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

## Update a project record through the interface

1. Open `admin.html` from the published website.
2. Confirm the repository owner, repository, and branch shown in the connection form.
3. Paste your personal token and select **Connect to register**.
4. Search for and select a student record.
5. Update the required information and checked evidence links.
6. Optionally add a short commit note.
7. Select **Save and commit record**.
8. Wait for the success message. The public GitHub Pages site will reflect the update after its normal deployment completes.

## Operational safeguards

- The token is only kept in the active browser tab. It is never written to the repository, local storage, or the public page source.
- The workspace checks the current file revision when saving. If another supervisor updates the register first, reload the current register before saving yours.
- GitHub records the account responsible for each commit in the repository history.
- Do not add passwords, access tokens, private links, protected documents, grades, student phone numbers, medical information, or any other confidential material.
- The workspace intentionally does not provide a delete function. Remove a record only through the repository with the appropriate administrative review.

## Repository configuration

The public settings in `assets/repository-config.js` identify the repository and branch used by default. They do not contain secret credentials. Update the file only if the repository is moved, renamed, or uses a different publishing branch.
