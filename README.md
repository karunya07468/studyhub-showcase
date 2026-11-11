# StudyHub

StudyHub is a full-stack student workspace built with React, Express, MongoDB, and Socket.IO. Accounts keep each person's tasks, notes, classmates, quiz history, and focus sessions in MongoDB. Signed-in devices receive live workspace updates over Socket.IO.

## Features

- Sign up and sign in with hashed passwords and short-lived bearer tokens.
- Create, update, complete, filter, and delete personal study tasks.
- Write autosaving notes with simple formatting and live updates across devices.
- Take a quiz graded by the server; quiz scores are shared on the class leaderboard only when a user opts in.
- Keep a private classmate directory, calculate course CGPA averages, and track study progress.
- Run a focus timer, view weekly activity, search the workspace, switch themes, and export account data.

## Run locally

Requires Node.js 22 or later and a MongoDB connection.

1. From the project folder, run `npm install`.
2. In the `server` folder, run `npm install`, then copy `.env.example` to `.env` and set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
3. In the `client` folder, run `npm install`.
4. Return to the project folder and run `npm run dev`. The React app opens at `http://localhost:5173` and the API runs at `http://localhost:4000`.

## Deploy the full app

The repository includes `render.yaml` for a single Render web service. It builds the React client, serves it from Express, connects MongoDB Atlas, and hosts the Socket.IO server on the same origin. Follow [SETUP.md](SETUP.md) to create Atlas and Render accounts and connect the database without putting credentials in GitHub.

GitHub Pages can host only the static React client. It needs the Render API URL configured as the `VITE_API_URL` GitHub Actions variable before Pages can use the shared backend. The current Pages URL remains the local-storage build until that backend URL is available.

## Data and privacy

Passwords are hashed before storage. Tasks, notes, and student-directory entries are scoped to the signed-in account. The quiz leaderboard includes names only for users who opt in. Keep `.env` values and database connection strings out of commits and chat messages.
