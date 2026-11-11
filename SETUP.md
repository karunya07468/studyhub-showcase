# Connect StudyHub to MongoDB Atlas and Render

This guide turns StudyHub into a shared app with accounts, saved data, and live updates. Create the accounts yourself. Do not send passwords, database connection strings, or secret keys in chat.

## 1. Create the MongoDB database

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a project and a free shared cluster.
3. Under **Database Access**, add a database user with read and write access for this app. Use a new, strong password.
4. In Atlas, open **Connect > Drivers > Node.js** and copy the connection string. Replace the password placeholder, URL-encode reserved characters in the password, and set the database name to `studyhub`.
5. Leave **Network Access** open for now. We will add Render's specific outbound IP ranges after the Render service is created.

See [Atlas connection setup](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).

## 2. Create the Render service

1. Create an account at [Render](https://render.com/).
2. In the dashboard, choose **New > Blueprint** and connect the public `karunya07468/studyhub-showcase` GitHub repository.
3. Render reads `render.yaml`. When prompted for `MONGODB_URI`, paste the Atlas connection string. Render generates `JWT_SECRET` for you. Keep both values private.
4. The first deployment may fail to connect because Atlas does not yet allow Render's network. This is expected. Once the service appears in Render, open **Connect > Outbound** and copy every IP range shown there.
5. In Atlas, open **Network Access**, add each Render IP range, and save the changes. Do not use an allow-from-anywhere rule.
6. In Render, choose **Manual Deploy > Deploy latest commit**. Wait until the deploy succeeds, then open the service's `onrender.com` URL and create your StudyHub account.

Use that same account on another device. Your tasks and notes are saved in Atlas, and changes sync through Socket.IO while the service is awake.

See [Render outbound IPs](https://render.com/docs/outbound-ip-addresses) and [Render Blueprints](https://render.com/docs/infrastructure-as-code).

## 3. Optional: connect the GitHub Pages address

The existing GitHub Pages address remains the browser-only version until you configure its API address. To connect it after Render is working:

1. In GitHub, open the repository's **Settings > Secrets and variables > Actions > Variables**.
2. Add a repository variable named `VITE_API_URL` with the Render service URL, for example `https://studyhub-app.onrender.com`.
3. Update the Pages workflow to build the React client with that variable and publish the client build.

Never put `MONGODB_URI` or `JWT_SECRET` in GitHub. Those belong only in Render's protected environment settings.

## Free hosting note

Render's free web service sleeps after 15 minutes without requests and can take about a minute to wake on the next visit. Live updates work while it is awake. See [Render's free-instance limits](https://render.com/docs/free).
