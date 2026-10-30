# TaskManager — React + Express + MongoDB

A task dashboard matching the supplied reference: navy sidebar, light dashboard, three status summary cards, add-task form, task table, inline title editing, status changes, filtering, and delete confirmation.

## 1. Requirements
- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)

## 2. Configure MongoDB
1. Create a free MongoDB Atlas cluster.
2. Create a database user and allow your development IP (or `0.0.0.0/0` for Render deployment; use a strong password).
3. Copy the MongoDB connection string.
4. Put it in `server/.env` as `MONGODB_URI`.

## 3. Run locally
From the project root:

```bash
npm install
npm run install:all
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/taskmanager?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Start both applications:
```bash
npm run dev
```
Open http://localhost:5173

The React app uses `/api` locally through the Vite proxy. The Express API runs on port 5000.

## 4. Deploy backend to Render
1. Push this project to a GitHub repository.
2. In Render, create **New > Web Service** and select the repository.
3. Set **Root Directory** to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL (for example `https://your-taskmanager.vercel.app`)
   - `NODE_ENV` = `production`
7. Deploy and copy the Render service URL, e.g. `https://your-taskmanager-api.onrender.com`.

A `render.yaml` blueprint is also included.

## 5. Deploy frontend to Vercel
1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Framework Preset: Vite.
4. Add environment variable:
   - `VITE_API_URL` = your Render URL + `/api` (for example `https://your-taskmanager-api.onrender.com/api`)
5. Deploy.

The included `client/vercel.json` rewrites SPA routes to `index.html`.

## 6. Important deployment order
Deploy Render first, then set `VITE_API_URL` in Vercel and deploy the frontend. Finally, update Render's `CLIENT_URL` with the exact Vercel domain and redeploy Render.

## API
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task
- `PATCH /api/tasks/:id` — update title/status
- `DELETE /api/tasks/:id` — delete task
- `GET /api/health` — health check

## Notes
- Do not commit `.env` files or publish database credentials.
- If the Render service is on its free tier, its first request after inactivity may take a little time to wake up.
