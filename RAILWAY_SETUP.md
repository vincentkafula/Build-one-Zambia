# Railway Deployment Setup Guide

## Overview

You have two Railway services:
- **Backend** — Node.js/Express API (port 3001)
- **Frontend** — Vite/React app served by Express (port auto-assigned by Railway)

The frontend needs to know where the backend lives. Railway provides a
`RAILWAY_PRIVATE_DOMAIN` variable automatically for every service — this is
the internal DNS name that other services in the same project can use to talk
to each other over the private network (free, fast, no public internet hop).

---

## Step 1 — Backend service Variables

Go to your **Backend** Railway service → **Variables** tab.

Add these (the RAILWAY_* ones are already there, auto-provided by Railway):

| Variable          | Value                                     |
|-------------------|-------------------------------------------|
| `JWT_SECRET`      | Any long random string (keep it secret)   |
| `ADMIN_USERNAME`  | `superadmin`                              |
| `ADMIN_PASSWORD`  | A strong password                         |
| `NODE_ENV`        | `production`                              |

You will also see `RAILWAY_PRIVATE_DOMAIN` already populated — copy its value,
you'll need it in the next step.

---

## Step 2 — Frontend service Variables

Go to your **Frontend** Railway service → **Variables** tab.

Add this one variable (use the private domain you copied from the backend):

| Variable                  | Value                                           |
|---------------------------|-------------------------------------------------|
| `BACKEND_PRIVATE_DOMAIN`  | *(paste the backend's RAILWAY_PRIVATE_DOMAIN)*  |

Example: if the backend's `RAILWAY_PRIVATE_DOMAIN` is `backend.railway.internal`,
set `BACKEND_PRIVATE_DOMAIN=backend.railway.internal`.

This uses Railway's **private network** — the fastest and free way to connect
services in the same project. No public URL needed.

### Alternative: use the public backend URL instead

If you prefer (or if the private network isn't working), you can set:

| Variable        | Value                                                  |
|-----------------|--------------------------------------------------------|
| `VITE_API_URL`  | `https://your-backend-service.up.railway.app`          |

This works too, but goes over the public internet. The private domain is better.

---

## Step 3 — Redeploy

After adding Variables, **redeploy both services** (Deployments → Redeploy).

---

## Verify it's working

1. **Backend health check:**
   Visit `https://your-backend.up.railway.app/make-server-8fca9621/health`
   → Should return `{"status":"ok",...}`

2. **Frontend:**
   Visit your frontend URL — should load the portal, not a blank page.

3. **Browser DevTools → Console:**
   No `Failed to fetch` or `localhost:3001` errors.

---

## Variable priority (how the frontend finds the backend)

The frontend `server.js` tries these in order:
1. `VITE_API_URL` — explicit public URL you set manually
2. `API_URL` — alternative name for the same thing  
3. `BACKEND_PRIVATE_DOMAIN` — Railway private network (recommended)
4. Falls back to same-origin (only if frontend & backend share a domain)

