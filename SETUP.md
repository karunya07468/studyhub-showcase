# Connect StudyHub to MongoDB Atlas and Render

This connects the React app to its Express API, MongoDB database, and live updates. Create the accounts yourself; don't send passwords, database connection strings, or secret keys in chat.

## 1. Create the MongoDB database

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Create a project and a free shared cluster.
3. In **Database Access**, add a database user with read/write access for this app. Use a new, strong password.
4. In **Network Access**, add the outbound IP ranges for the Render service after it has been created. Render shows them under the service's **Connect > Outbound** menu. Atlas only accepts connections from IP ranges on this allowlist. See [Atlas connection setup](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) and [Render outbound IPs](https://render.com/docs/outbound-ip-addresses).
5. In Atlas, choose **Connect → Drivers → Node.js** and copy the connection string. Replace the password placeholder, URL-encode any reserved characters in the password, and use `studyhub` as the database name.

## 2. Create the Render service

1. Create a Render account at [render.com](https://render.com/).
2. In the Render dashboard, choose **New > Blueprint** and connect the public `karunya07468/studyhub-showcase` GitHub repository.
3. Render reads the repository's `render.yaml`. When asked for `MONGODB_URI`, enter the Atlas connection string. The blueprint generates `JWT_SECRET` for you.
4. After Render creates the service, copy its **Connect → Outbound** IP ranges into Atlas **Network Access** if you haven't already. The server starts after Atlas allows those addresses and the `MONGODB_URI` value is saved.
5. Wait for the deployment to finish, then open the service's `onrender.com` URL and create your StudyHub account. Use the same account on another device to see the same data and live changes.

The app stores account data in Atlas, not on the Render server's local disk. Open the same account on another device to see your tasks and notes; changes update over Socket.IO while both devices are connected.

## 3. Optional: connect the GitHub Pages address

The existing GitHub Pages address is still the browser-only build. To make that address use the shared backend after Render deploys:

1. In GitHub, open the repository's **Settings → Secrets and variables → Actions → Variables**.
2. Add a repository variable named `VITE_API_URL` with the Render service's `https://...onrender.com` URL.
3. The Pages workflow can then build the React client with that API URL and publish it to GitHub Pages.

Don't put `MONGODB_URI` or `JWT_SECRET` in GitHub Actions variables. Those belong only in Render's protected environment settings.

## Free hosting note

Render's free web service goes idle after 15 minutes without incoming traffic and can take about a minute to wake on the next request. Socket.IO updates are live while the service is awake. See [Render's free-instance limits](https://render.com/docs/free).
