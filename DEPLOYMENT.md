# Full-Stack Deployment Runbook

This guide covers deploying **Verdict Studio & Haize Sentinel** across **Render** (Backend FastAPI Service) and **Vercel / Cloudflare Pages** (Frontend Next.js Application).

---

## Architecture Summary

```
   ┌─────────────────────────────────────────────────────────┐
   │             Vercel / Cloudflare Pages                   │
   │               Next.js 14 Web Application                │
   │           https://your-frontend.vercel.app              │
   └──────────────────────────┬──────────────────────────────┘
                              │
              REST APIs       │       WebSocket Telemetry
          (POST /api/dag/...) │    (WSS /ws/telemetry)
                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    Render Web Service                   │
   │                FastAPI + Verdict Engine                 │
   │        https://verdict-studio-backend.onrender.com      │
   └─────────────────────────────────────────────────────────┘
```

---

## 1. Deploying Backend on Render

Render hosts the FastAPI application, in-memory datastores, WebSocket telemetry hub, and the topological Verdict execution engine.

### Option A: Blueprints (Infrastructure as Code)
1. Push the repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), select **Blueprints > New Blueprint Instance**.
3. Select your repository. Render will read [`render.yaml`](./render.yaml) and configure the service.
4. Click **Apply**.

### Option B: Manual Web Service Setup
1. In the Render Dashboard, click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `verdict-studio-backend` (or your chosen name)
   - **Region**: `Oregon (US West)` (or closest to your users)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Advanced > Environment Variables**:
   - `PYTHON_VERSION`: `3.11.9`
   - `CORS_ORIGINS`: `*`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL:
   `https://verdict-studio-backend.onrender.com`

---

## 2. Deploying Frontend on Vercel

1. In the [Vercel Dashboard](https://vercel.com/), click **Add New > Project**.
2. Import your GitHub repository.
3. Under **Project Settings**:
   - **Root Directory**: Click Edit and select `frontend`.
   - **Framework Preset**: `Next.js`
4. Under **Environment Variables**, add:
   | Variable Name | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://verdict-studio-backend.onrender.com` | HTTPS base URL of your Render backend |
   | `NEXT_PUBLIC_WS_URL` | `wss://verdict-studio-backend.onrender.com` | WSS WebSocket URL of your Render backend |
5. Click **Deploy**.

---

## 3. Deploying Frontend on Cloudflare Pages (Alternative)

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select your repository and configure:
   - **Project Name**: `verdict-studio`
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js (Static HTML Export)`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `out`
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://verdict-studio-backend.onrender.com`
   - `NEXT_PUBLIC_WS_URL`: `wss://verdict-studio-backend.onrender.com`
4. Click **Save and Deploy**.

---

## 4. Post-Deployment Verification Checklist

1. **Verify Backend Health**:
   ```bash
   curl -I https://<your-render-app>.onrender.com/api/health
   # Expected: HTTP/1.1 200 OK with {"status":"ok"}
   ```
2. **Verify Frontend UI**:
   - Visit `https://<your-frontend>.vercel.app` or `https://<your-frontend>.pages.dev`.
   - Look at the sidebar bottom footer: it should display **`Gateway Core: ONLINE`** with a pulsing green indicator.
3. **Verify WebSocket Live Stream**:
   - Navigate to `/dag-studio`.
   - Click **Run Debate Simulation**.
   - Verify that the bottom console opens and streams tokens in real time.
4. **Verify Scoped MCP Key Creation**:
   - Navigate to `/mcp-keys`.
   - Click **Create Scoped Key**, configure permissions, and generate a new key.
   - Verify that the Claude Desktop / Cursor config snippet modal reflects the production backend URL.

---

## 5. Troubleshooting

- **CORS Errors**: The FastAPI backend includes `allow_origins=["*"]` and `allow_origin_regex=r"https?://.*"`. If you enforce strict origin whitelisting, set `CORS_ORIGINS=https://your-frontend.vercel.app` in Render environment variables.
- **WebSocket Connection Failures**: Ensure `NEXT_PUBLIC_WS_URL` begins with `wss://` (secure WebSocket) when connecting from HTTPS frontend deployments.
- **Render Free Tier Cold Starts**: Render free tier instances spin down after 15 minutes of inactivity. The frontend includes automatic retry reconnection timers (4-second exponential backoff) and displays `Gateway Core: CHECKING` while the instance warms up.
