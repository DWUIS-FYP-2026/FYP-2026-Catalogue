# Verified public-register sync

This version prevents a supervisor form from reporting a link update as complete unless it reads `assets/projects.js` back from GitHub and confirms that the saved record contains the same four evidence links.

After each successful create, update, or delete:

1. The workspace commits the change to GitHub.
2. It reads the committed data file back from GitHub.
3. It verifies the selected record and its evidence links.
4. It refreshes the public register from the verified record set.
5. An open project-record window refreshes automatically.

A green success message displays the confirmed `x/4` evidence-link total. A mismatch produces an error rather than incorrectly claiming that the public record is updated.
