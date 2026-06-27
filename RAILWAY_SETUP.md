# Railway Deployment Setup Guide

## Why the site was showing blank

The frontend uses Vite which **bakes environment variables at build time**.
If `VITE_API_URL` is not set as a Railway Variable *before* the build runs,
the frontend defaults to `http://localhost:3001`, which doesn't exist in production.

This has been fixed with a runtime injection fallback in `server.js`, but you
must still set `VITE_API_URL` in Railway for full reliability.

---

## Step-by-step Railway setup

### Backend Service

In your Railway backend service → **Variables** tab, add:

| Variable          | Value                                    |
|-------------------|------------------------------------------|
| `PORT`            | (Railway sets this automatically)        |
| `JWT_SECRET`      | `<long random string — change this!>`    |
| `ADMIN_USERNAME`  | `superadmin`                             |
| `ADMIN_PASSWORD`  | `<strong password — change this!>`       |
| `NODE_ENV`        | `production`                             |

**After deploying the backend**, copy the Railway-generated URL (e.g. `https://boz-backend.up.railway.app`).

### Frontend Service

In your Railway frontend service → **Variables** tab, add:

| Variable          | Value                                              |
|-------------------|----------------------------------------------------|
| `VITE_API_URL`    | `https://your-backend.up.railway.app` (from above) |
| `NODE_ENV`        | `production`                                       |

⚠ **Important**: Set `VITE_API_URL` BEFORE the frontend build runs.
   If you set it after, go to **Deployments → Redeploy** to trigger a new build.

### Optional: Custom domain

If you add a custom domain (e.g. `bozplans.org`) to the frontend service,
add it to the backend's CORS list by setting:

| Variable         | Value                        |
|------------------|------------------------------|
| `FRONTEND_URL`   | `https://bozplans.org`       |

---

## Checking if it's working

1. Visit `https://your-backend.up.railway.app/make-server-8fca9621/health`
   → Should return `{"status":"ok",...}`

2. Visit your frontend URL
   → Should show the Build One Zambia portal (not a blank page)

3. Open browser DevTools → Console
   → Should be no `Failed to fetch` or `localhost:3001` errors

