# 🇿🇲 Build One Zambia Portal

Full-stack web portal: **React** frontend + **Node.js / Express** backend.

---

## Project Structure

```
boz-portal/
├── backend/                  ← Node.js / Express API server
│   ├── src/
│   │   ├── index.js          ← Main server (all routes)
│   │   ├── db.js             ← JSON file key-value store
│   │   ├── auth.js           ← PBKDF2 hashing + JWT sessions
│   │   ├── leadership.js     ← National & provincial leaders
│   │   ├── news.js           ← News articles
│   │   ├── candidates.js     ← Election candidates
│   │   ├── registrations.js  ← Member / intern / agent sign-ups
│   │   ├── press.js          ← Press statements (with PDF download)
│   │   ├── elections.js      ← Polling results & aggregation
│   │   └── documents.js      ← Document library
│   ├── uploads/
│   │   └── leaders/          ← Leader portrait images (8 included)
│   ├── data/                 ← Auto-created; holds kv.json (database)
│   ├── .env                  ← Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── dist/                 ← Production build (ready to deploy)
│   ├── src/                  ← React source (TypeScript + Vite)
│   ├── .env                  ← Frontend environment variables
│   └── package.json
│
├── start.sh                  ← One-command local start
└── README.md
```

---

## Quick Start (Local)

### 1. Start the backend

```bash
cd backend
npm install          # first time only
node src/index.js
```

The API will be available at **http://localhost:3001**

### 2. Serve the frontend

The `frontend/dist/` folder is a fully built static site. Serve it with any tool:

```bash
# Option A — npx serve (zero install)
npx serve frontend/dist

# Option B — Python
python3 -m http.server 3000 --directory frontend/dist

# Option C — copy dist/ to your web server's public folder
```

Open **http://localhost:3000** in your browser.

---

## Admin Login

| Field    | Value              |
|----------|--------------------|
| Username | `superadmin`       |
| Password | `Admin@BOZ2024`    |

> ⚠️ **Change these before deploying to production** — edit `backend/.env`

---

## Environment Variables

### backend/.env

```env
PORT=3001
JWT_SECRET=boz-jwt-secret-change-in-production-2024
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=Admin@BOZ2024
```

### frontend/.env

```env
VITE_API_URL=http://localhost:3001
```

For production, set `VITE_API_URL` to your backend's public URL (e.g. `https://api.bozplans.org`), then rebuild the frontend:

```bash
cd frontend
npm run build
```

---

## Deploying to Production

### Backend (Node.js server)

Deploy to any Node.js host (Railway, Render, VPS, etc.):

```bash
# On your server:
cd backend
npm install --production
node src/index.js
```

Recommended: use **PM2** for process management:

```bash
npm install -g pm2
pm2 start src/index.js --name boz-backend
pm2 save
pm2 startup
```

### Frontend (static files)

Upload `frontend/dist/` to:
- **Netlify** — drag and drop the `dist/` folder
- **Vercel** — `vercel --prod` from the `frontend/` directory
- **Nginx / Apache** — copy `dist/` to your web root

**Nginx example config:**

```nginx
server {
    listen 80;
    server_name bozplans.org www.bozplans.org;
    root /var/www/boz/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /make-server-8fca9621/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
    }
}
```

---

## Leadership Images

All 8 national leadership portraits are included and displayed:

| Name | Position |
|------|----------|
| Vincent Kafula | Presidential Candidate |
| Mukubesa Mundia | Deputy President |
| Mulaza Kaira | Secretary General |
| Scart Chansa Kantanta | Deputy Secretary General |
| Gary Nkombo | Chairperson |
| Willah Mudolo | Deputy Chairperson |
| Christopher Kang'ombe | Treasurer General |
| Joseph Kalimbwe | Deputy Treasurer General |

Images are served from `backend/uploads/leaders/` and automatically referenced when the backend seeds the database on first start.

---

## Data Persistence

All data is stored in `backend/data/kv.json`. This file is created automatically on first run.

- **Back up** this file regularly in production
- To **reset** the portal to a clean state, delete `kv.json` and restart

---

## API Endpoints (summary)

All routes are prefixed with `/make-server-8fca9621`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Server health check |
| POST | `/auth/login` | — | Login → JWT token |
| GET | `/leadership` | — | List all leaders |
| GET | `/news/posts` | — | List published news |
| GET | `/candidates` | — | List candidates |
| POST | `/register/member` | — | Member registration |
| POST | `/register/internship` | — | Internship application |
| POST | `/register/agent` | — | Polling agent application |
| GET | `/press` | — | Press statements |
| GET | `/press/:id/download` | — | Download statement PDF |
| GET | `/documents/:id/download` | — | Download document |
| POST | `/candidates` | Admin | Add candidate |
| POST | `/news/posts` | Admin | Create news post |
| POST | `/leadership` | Admin | Add leader |

Full API documentation: see `API_DOCUMENTATION.md`
