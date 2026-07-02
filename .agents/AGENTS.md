# Project Rules

## Firebase Deployments
- When running `firebase deploy`, ALWAYS include the deployment message matching the GitHub commit message using the `-m` (or `--message`) flag.
  Example:
  `firebase deploy --only hosting -m "feat: add meta tags and post-build script for landing page og:meta properties"`
