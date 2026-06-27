# 🇿🇲 Railway Deployment — Connecting Frontend to Backend

## The Problem
The frontend and backend are deployed as two separate Railway services.
The frontend's `server.js` proxies all `/make-server-8fca9621/*` API calls
to the backend — but it needs to know **where** the backend lives.

## The Fix — One Environment Variable

### Step 1: Get your backend URL
1. Go to [railway.app](https://railway.app) → your project
2. Click on the **backend service** (the one running `node src/index.js`)
3. Go to **Settings** → **Networking** → **Public Networking**
4. Copy the public URL, e.g.: `https://build-one-zambia-backend-production.up.railway.app`
5. Verify it works: visit `<your-backend-url>/make-server-8fca9621/health` in your browser
   - You should see: `{"status":"ok","server":"node-express",...}`

### Step 2: Set BACKEND_URL on the frontend service
1. Click on the **frontend service** (the one running `node server.js`)
2. Go to **Variables** tab
3. Click **New Variable**
4. Set:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://build-one-zambia-backend-production.up.railway.app`
     *(use your actual backend URL from Step 1 — no trailing slash)*
5. Click **Add** → Railway will automatically **redeploy** the frontend

### Step 3: Verify the connection
After redeploy completes, visit:
- `https://<your-frontend-url>/__debug/backend`
  - You should see: `{"configured":true,"backendStatus":200,...}`
- `https://<your-frontend-url>/health`
  - You should see: `{"status":"ok","backendConfigured":true,...}`

## Railway Internal Networking (Optional — Faster)
If both services are in the **same Railway project**, you can use private networking
instead of the public URL (avoids internet round-trip):

1. In the backend service → **Settings** → **Networking** → enable **Private Networking**
2. Use the internal URL format:
   - `BACKEND_URL=http://backend.railway.internal:3001`
   - Replace `backend` with your backend service's Railway name (lowercase, hyphens)
   - Replace `3001` with your backend's PORT value

## Environment Variables Summary

### Frontend Service Variables
| Variable | Value | Required |
|----------|-------|----------|
| `BACKEND_URL` | `https://your-backend.up.railway.app` | ✅ YES |
| `PORT` | (set by Railway automatically) | Auto |

### Backend Service Variables
| Variable | Value | Required |
|----------|-------|----------|
| `PORT` | (set by Railway automatically) | Auto |
| `JWT_SECRET` | A long random string | Recommended |
| `ADMIN_USERNAME` | Admin username | Optional |
| `ADMIN_PASSWORD` | Admin password | Optional |

## Architecture
```
User Browser
     │
     ▼
Frontend (Railway)          — serves built React app
server.js:PORT              — Node.js/Express
     │
     │  /make-server-8fca9621/* → proxy
     │  /uploads/*              → proxy
     ▼
BACKEND_URL ──────────────► Backend (Railway)
                             src/index.js:PORT
                             Express API + KV database
```
