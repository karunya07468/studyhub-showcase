# StudyHub

StudyHub is a student workspace for keeping everyday study work together. The site opens directly into a working dashboard, with no build step or account setup.

## What you can do

- Create, edit, complete, filter, and remove study tasks with due dates and priorities.
- Write and organize notes with autosave and simple heading, bold, and list formatting.
- Run a 25-minute focus timer and track completed sessions.
- Take a short interactive study-skills quiz and keep a personal score history.
- Search a class directory, add classmates, sort by name or CGPA, and remove entries.
- View progress, recent notes, upcoming tasks, and a weekly activity chart on the dashboard.
- Change the profile and theme, and export a JSON backup of workspace data.

## Open or publish

Open `index.html` in a modern browser to use the app. It uses plain HTML, CSS, and JavaScript, with no installation required. GitHub Actions publishes the repository to GitHub Pages after changes reach the `main` branch.

The app saves data in the browser's local storage. It works as a personal workspace on that device, and changes are shared between tabs in the same browser. It does not currently provide sign-in, cloud backup, or collaboration between different people or devices. The class directory starts with fictional sample entries that can be removed or replaced.

## Files

- `index.html` — StudyHub workspace interface
- `styles.css` — responsive light and dark themes
- `app.js` — tasks, notes, quiz, directory, focus timer, and local saving
- `.github/workflows/deploy.yml` — automatic GitHub Pages deployment
