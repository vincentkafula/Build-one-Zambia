# Railway Deployment — Variable Setup

## Backend service Variables

Add these in your backend Railway service → Variables tab:

| Variable         | Value                              |
|------------------|------------------------------------|
| `JWT_SECRET`     | Any long random string             |
| `ADMIN_USERNAME` | `superadmin`                       |
| `ADMIN_PASSWORD` | A strong password                  |
| `NODE_ENV`       | `production`                       |

Railway auto-provides the rest (`RAILWAY_PRIVATE_DOMAIN`, `PORT`, etc.).

Also note down the value of **`RAILWAY_PRIVATE_DOMAIN`** — you'll need it below.
And note down the value of **`PORT`** — Railway assigns this automatically.

---

## Frontend service Variables

Add these in your frontend Railway service → Variables tab:

| Variable                  | Value                                                    |
|---------------------------|----------------------------------------------------------|
| `BACKEND_PRIVATE_DOMAIN`  | *(backend's `RAILWAY_PRIVATE_DOMAIN` value)*             |
| `BACKEND_PORT`            | *(backend's `PORT` value, e.g. `3001` or Railway's port)*|
| `NODE_ENV`                | `production`                                             |

**Example:**
```
BACKEND_PRIVATE_DOMAIN = build-one-zambia.railway.internal
BACKEND_PORT           = 3001
```

This connects via Railway's **private network** — faster and free.

---

## After setting Variables

1. Redeploy both services (Deployments → Redeploy)
2. Check backend health: `https://your-backend.up.railway.app/make-server-8fca9621/health`
   → Should return `{"status":"ok",...}`
3. Visit the frontend URL — should no longer be blank

---

## Variable priority (how the frontend finds the backend)

```
VITE_API_URL  →  API_URL  →  BACKEND_PRIVATE_DOMAIN:BACKEND_PORT  →  localhost:3001
```

