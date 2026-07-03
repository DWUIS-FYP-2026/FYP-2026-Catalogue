# Main Register Synchronisation

The supervisor workspace now updates the public project register in the same browser immediately after a successful GitHub commit.

- Saving or adding a record updates the main table, filters, counts and evidence totals.
- The **View updated record in main register** button closes the workspace and opens that record in the public register.
- Other open tabs in the same browser receive the new record data automatically.
- GitHub Pages continues to publish the committed file to all other visitors after the normal deployment delay.

This does not store the GitHub access token in the public page.
