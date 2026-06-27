# Railway Deployment Setup Guide

## Architecture
Two Railway services in the same project:
- **backend** — Node.js/Express API (`IS_BACKEND=true`)
- **frontend** — Vite SPA + Express proxy server

---

## Step 1: Deploy Backend Service

### Variables (backend service)
| Variable | Value |
|---|---|
| `IS_BACKEND` | `true` |
| `JWT_SECRET` | (any long random string, e.g. 64 chars) |
| `ADMIN_USERNAME` | `superadmin` (or your choice) |
| `ADMIN_PASSWORD` | (strong password) |
| `NODE_ENV` | `production` |

### After deploying backend:
1. Go to **backend service → Logs** and look for the startup banner.
2. It will print something like:
   ```
   🔌  PORT (Railway)  : 8080
   🔗  Private net URL : http://my-backend.railway.internal:8080
   👉  Set BACKEND_URL in the frontend service to:
       http://my-backend.railway.internal:8080
   ```
3. **Copy that URL** — you need it for the frontend.

---

## Step 2: Deploy Frontend Service

### Variables (frontend service)
| Variable | Value |
|---|---|
| `BACKEND_URL` | The private networking URL from Step 1 (e.g. `http://my-backend.railway.internal:8080`) |
| `NODE_ENV` | `production` |

> ⚠️ **Do NOT use the public URL** (`https://....up.railway.app`) for `BACKEND_URL`.  
> Use the **private networking URL** (`http://....railway.internal:PORT`).  
> Both services must be in the **same Railway project**.

---

## Step 3: Verify

After both services are running:
1. Visit your frontend URL: `https://your-frontend.up.railway.app/health`
   - Should return `{"status":"ok","backendConfigured":true,...}`
2. Visit: `https://your-frontend.up.railway.app/__debug/backend`
   - Should return `{"configured":true,"backendStatus":200,...}`
3. Visit: `https://your-backend.up.railway.app/make-server-8fca9621/health`
   - Should return `{"status":"ok","server":"node-express",...}`

---

## Troubleshooting

### `502 Bad Gateway` on API calls
→ `BACKEND_URL` is wrong. Check `/__debug/backend` on the frontend.

### `BACKEND_URL not set` error
→ Go to Railway → Frontend service → Variables → Add `BACKEND_URL`.

### Backend not starting
→ Check backend logs. Ensure `IS_BACKEND=true` is set on the backend service.

### PORT unknown
→ Check backend startup logs. Railway injects `PORT` automatically at runtime.  
→ The backend logs it clearly as `🔌  PORT (Railway)  : XXXX`.

---

## Private Networking URL Format

```
http://<RAILWAY_SERVICE_NAME>.railway.internal:<PORT>
```

- `RAILWAY_SERVICE_NAME` is the name shown in Railway dashboard (e.g. `backend`, `web`, etc.)
- `PORT` is logged by the backend on startup
- Both services **must be in the same Railway project**
