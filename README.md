# StudyHub

StudyHub is a student learning portal showcase based on the StudyHub project theory. It turns the theory's 15 Express, MongoDB and React modules into an editorial-style, responsive site with interactive concept demos.

## Explore

- A student dashboard, task list, quiz, class directory, API route playground, middleware trace, EJS-style feedback form, MongoDB query lab and session simulator.
- All 15 syllabus modules, including REST APIs, Express routing, middleware, EJS, sessions, MongoDB CRUD and aggregation, React fundamentals, state, forms, Router, hooks, the task app, quiz and dashboard integration.
- Searchable module details and locally saved completion progress.
- Light and dark themes, responsive navigation, keyboard-accessible controls and reduced-motion support.

## Run the showcase

Open index.html in a browser. There is no build step or package installation. On GitHub Pages, the static site is published automatically from the main branch by the deployment workflow.

Demo tasks, directory changes, theme choice and module progress are stored in this browser's local storage. The route console, middleware, EJS and session tools simulate concepts with sample data. They do not connect to a server or database.

## Architecture represented by the theory

The source theory describes a separate full-stack application:

- React + Vite single-page client
- Express + Node API, sessions, middleware and EJS routes
- MongoDB Atlas accessed through Mongoose

GitHub Pages hosts the static showcase. It does not run the Express or MongoDB services. To run the complete application described in the theory, use the server/ and client/ source folders and configure a MongoDB Atlas URI and session secret. Do not publish real credentials.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository's main branch.
2. In the repository, open Settings → Pages and select GitHub Actions as the source.
3. Open Actions and wait for Deploy StudyHub to GitHub Pages to complete.
4. Visit https://YOUR-USERNAME.github.io/REPOSITORY-NAME/.

Every later push to main will publish the updated site.
