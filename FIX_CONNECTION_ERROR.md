# Fix: Supervisor Workspace Register Load Error

This release fixes the message:

> Expected property name or '}' in JSON …

The public register uses valid JavaScript data in `assets/projects.js`, where properties are written as `id:`, `student:` and so on. The previous workspace expected JSON property names to be quoted, so it could not load the original register before the first save.

The workspace now safely supports both formats:

- the original JavaScript-style data file; and
- the JSON-style data file written by the workspace after an update.

No GitHub token or repository setting needs to change.

## Publish the fix

Replace your current website files with this release, then run:

```bash
git add -A
git commit -m "Fix supervisor workspace register loading"
git push origin main
```

Refresh the published site with `Ctrl + F5`, open **Supervisor Sign In**, and select **Connect to register** again.
