# 🚀 The Ultimate Free Deployment Guide
## Vercel + Render + Aiven (No Docker)

This guide will help you deploy your **CollabVault** project for **FREE** with 24/7 uptime using:
1.  **Aiven** (MySQL Database) - Free
2.  **Render** (Backend API) - Free 750 hours/month
3.  **Vercel** (Frontend) - Free Unlimited

---

### **📝 Prerequisites**
*   **Two GitHub Repositories** (or one repo with two folders):
    *   Repo 1: `frontend` (Uploaded to your GitHub Account 2)
    *   Repo 2: `backend` (Uploaded to your GitHub Account 1)
*   **Accounts:**
    *   Aiven Account
    *   Render Account (Account 1 - `laasyan.2004@gmail.com`)
    *   Vercel Account (Account 2 - `nlaasya.04@gmail.com`)

---

### **Step 1: Database Setup (Aiven)** 🗄️

1.  Log in to [Aiven.io](https://aiven.io/).
2.  Click **Create Service**.
3.  Select **MySQL**.
4.  Choose the **Free Plan** (Cloud: Google Cloud, Region: Closest to you).
5.  Click **Create Service**.
6.  Wait for the service to start (Green dot "Running").
7.  **Copy Connection Details:**
    *   Host
    *   Port
    *   User
    *   Password
    *   Database Name (usually `defaultdb`)

---

### **Step 2: Backend Deployment (Render)** ⚙️

**Use Account:** `laasyan.2004@gmail.com`

1.  Log in to [Render.com](https://render.com/).
2.  Click **New +** → **Web Service**.
3.  Connect your **Backend GitHub Repository**.
4.  **Fill these details:**
    *   **Name:** `collabvault-backend`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
    *   **Root Directory:** `backend` (or leave empty if repo is just backend code)
5.  **Environment Variables (Add these):**
    *   `DB_HOST` = (Paste from Aiven)
    *   `DB_USER` = (Paste from Aiven)
    *   `DB_PASS` = (Paste from Aiven)
    *   `DB_NAME` = `defaultdb`
    *   `DB_PORT` = (Paste from Aiven Port)
    *   `PORT` = `10000`
    *   `JWT_SECRET` = (Type any secret password)
6.  Click **Deploy Web Service**.
7.  **Wait for Deployment:** It will take a few minutes.
8.  **Copy Backend URL:** Once live, copy the URL (e.g., `https://collabvault-backend.onrender.com`).

---

### **Step 3: Frontend Deployment (Vercel)** 🎨

**Use Account:** `nlaasya.04@gmail.com`

1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** → **Project**.
3.  Import your **Frontend GitHub Repository**.
4.  **Configure Project:**
    *   **Framework Preset:** Next.js (Should auto-detect)
    *   **Root Directory:** `Frontend` (Click Edit if it's not auto-selected)
5.  **Environment Variables:**
    *   `NEXT_PUBLIC_API_URL` = (Paste your **Render Backend URL**)
    *   *Important: Do NOT add a trailing slash `/` at the end.*
6.  Click **Deploy**.
7.  **Wait:** In ~1 minute, your site will be live!
8.  **Copy Frontend URL:** (e.g., `https://collabvault.vercel.app`).

---

### **Step 4: Keep Backend Awake ⚡ (Optional but Recommended)**

Render's free tier sleeps after 15 minutes of inactivity. Vercel never sleeps. To keep the backend awake:

1.  Go to [UptimeRobot.com](https://uptimerobot.com/) (Free).
2.  Click **Add New Monitor**.
    *   **Monitor Type:** HTTP(s)
    *   **Friendly Name:** Backend Keeper
    *   **URL:** (Your Render Backend URL)
    *   **Monitoring Interval:** 5 minutes
3.  Click **Create Monitor**.

---

### **🎉 Done!**

*   **Frontend:** Hosted on Vercel (Unlimited, Ultra-fast)
*   **Backend:** Hosted on Render (750 hours = 24/7 with UptimeRobot)
*   **Database:** Hosted on Aiven (Persistent Storage)
