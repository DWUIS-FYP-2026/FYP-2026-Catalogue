# Full Project Record Management Update

This release extends the integrated supervisor workspace to support the full project-record workflow without directly editing `assets/projects.js`.

## Available actions

- **Create:** Select **Add project record**, complete the form, and commit it to the repository.
- **Read:** Search and open an existing student record in the supervisor list or public register.
- **Update:** Select **Edit record**, revise the fields or project links, then commit the change.
- **Delete:** Select an existing record, choose **Remove record**, type `DELETE`, then confirm. GitHub preserves prior versions in commit history.

## Safeguards

- Required fields are checked before a record is added or updated.
- The workspace prevents duplicate student names.
- Existing record IDs cannot be changed.
- Each save uses the current GitHub file revision to reduce overwrite risk. Reload the register if another supervisor has committed a change.
- Remove only duplicates, withdrawn projects, or records created in error. Use the update form for normal changes.

## Publish

Replace the current site files with this release and push them to the publishing branch:

```bash
git add -A
git commit -m "Add full CRUD controls to supervisor workspace"
git push origin main
```
