# Deploying the frontend

The web app (Vite + React) is deployed on **Vercel**. The API lives in a separate
repository, deployed on Render. `vercel.json` proxies `/api` and `/uploads` to it
and serves `index.html` for client-side routes.

1. In Vercel: **Add New → Project**, pick this repository. Vercel detects Vite
   (build `yarn build`, output `dist`).
2. Environment variable: `VITE_GOOGLE_CLIENT_ID` (same as local `.env`).
3. Deploy. If the backend's Render URL isn't `https://groundtrust-api.onrender.com`,
   update both destinations in `vercel.json` and redeploy.
4. Set the backend's `CLIENT_URL` on Render to this app's Vercel URL.
5. In Google Cloud Console → Credentials → the OAuth client, add the Vercel URL to
   **Authorized JavaScript origins**, or Google sign-in will be refused.

The backend sleeps after 15 minutes idle on Render's free tier, so the first request
after a quiet period can take about a minute.
