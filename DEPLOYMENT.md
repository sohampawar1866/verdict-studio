# 🚀 Full-Stack Deployment Runbook

This guide covers deploying **Verdict Studio & Haize Sentinel** across **Render** (Backend FastAPI Service) and **Cloudflare Pages** (Frontend Next.js Static Export).

---

## 🏗️ Architecture Summary

```
   ┌─────────────────────────────────────────────────────────┐
   │                  Cloudflare Pages (Edge)                │
   │               Static Next.js 14 Web UI                  │
   │         https://verdict-studio.pages.dev                │
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

## 1. ⚡ Deploying Backend on Render

Render hosts the FastAPI application, in-memory datastores, WebSocket telemetry hub, and the topological Verdict execution engine.

### Option A: 1-Click Infrastructure as Code (Recommended)
1. Fork or push the repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), select **Blueprints > New Blueprint Instance**.
3. Select your repository. Render will automatically read [`render.yaml`](./render.yaml) and configure the service.
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

## 2. 🌐 Deploying Frontend on Cloudflare Pages

Cloudflare Pages provides global CDN edge delivery with zero cold starts for the static export bundle.

### Step-by-Step Setup:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages > Create application > Pages > Connect to Git**.
3. Select your `verdict-studio` repository.
4. Configure the build settings:
   - **Project Name**: `verdict-studio`
   - **Production Branch**: `master`
   - **Framework Preset**: `None` or `Next.js (Static HTML Export)`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `out`
5. In the **Environment Variables** section, add:
   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://verdict-studio-backend.onrender.com` |
   | `NEXT_PUBLIC_WS_URL` | `wss://verdict-studio-backend.onrender.com` |
   | `NODE_VERSION` | `18.20.0` or `20.x` |
6. Click **Save and Deploy**.

Cloudflare Pages will build the static export and deploy it to `https://verdict-studio.pages.dev`.

---

## 3. 🔍 Post-Deployment Verification Checklist

Once both services are active:

1. **Verify Backend Health**:
   ```bash
   curl -I https://<your-render-app>.onrender.com/api/health
   # Expected: HTTP/1.1 200 OK with status: "ok"
   ```
2. **Verify Frontend UI**:
   - Visit `https://<your-pages-app>.pages.dev`.
   - Look at the sidebar bottom footer: it should display **`Gateway Core: ONLINE`** with a pulsing green indicator.
3. **Verify WebSocket Live Stream**:
   - Navigate to `/dag-studio`.
   - Click **Run Debate Simulation**.
   - Verify that the bottom console opens and streams token-by-token arguments in real-time.
4. **Verify Scoped MCP Key Creation**:
   - Navigate to `/mcp-keys`.
   - Click **Create Scoped Key**, configure permissions, and generate a new key.
   - Verify that the Claude Desktop / Cursor config snippet modal reflects the production backend URL.

---

## 4. 🛠️ Troubleshooting

- **CORS Errors**: The FastAPI backend includes `allow_origins=["*"]` and `allow_origin_regex=r"https?://.*"`. If you enforce strict origin whitelisting, set `CORS_ORIGINS=https://verdict-studio.pages.dev` in Render environment variables.
- **WebSocket Connection Failures**: Ensure `NEXT_PUBLIC_WS_URL` begins with `wss://` (secure WebSocket) when connecting from HTTPS Cloudflare Pages.
- **Render Free Tier Cold Starts**: Render free tier instances spin down after 15 minutes of inactivity. The frontend includes automatic retry reconnection timers (4-second exponential backoff) and displays `Gateway Core: CHECKING` while the instance warms up.
