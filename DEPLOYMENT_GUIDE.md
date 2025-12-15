# Deployment Guide: Free & Always On (No AWS/Google)

This guide is designed for **maximum free uptime (24/7)** using developer-friendly platforms (PaaS) instead of big clouds like AWS/Google.

**The Strategy:**
1.  **Backend**: **Render** (Free Tier)
    *   *Constraint*: It sleeps after 15 minutes of inactivity.
    *   *Solution*: We will use a free "pinger" service to keep it awake 24/7.
    *   *Limit*: Render gives **750 free hours/month**. Since a 31-day month has **744 hours**, this fits perfectly (with 6 hours to spare).
2.  **Database**: **Aiven** OR **TiDB Cloud** (Free MySQL)
    *   *Option A (Aiven)*: Standard managed MySQL. 1GB Storage. Easy to use.
    *   *Option B (TiDB)*: Serverless MySQL. 5GB Storage. Better if you expect lots of data.
3.  **Frontend**: **Vercel**
    *   *Why?* Best free hosting for Next.js.

---

## Part 1: Database (Choose One)

### Option A: Aiven (Recommended for Simplicity)
1.  Go to [Aiven.io](https://aiven.io/) and sign up (No credit card required).
2.  Create a new service -> **MySQL**.
3.  Select **Free Plan** (it might be hidden under a "Free" tab or "Hobby" section).
4.  Choose the region closest to you.
5.  Wait for it to start (it shows "Running").
6.  Copy the **Service URI** (it looks like `mysql://user:password@host:port/defaultdb`).

### Option B: TiDB Cloud (Recommended for Storage)
1.  Go to [TiDB Cloud](https://tidbcloud.com/) and sign up.
2.  Create a **Serverless** cluster (Free Forever).
3.  Once created, click **"Connect"** to get your credentials.
4.  Run `CREATE DATABASE teamup;` in the SQL Editor.

---

## Part 2: Backend (Render.com)

1.  Push your code to **GitHub**.
2.  Go to [Render](https://render.com/) and sign up.
3.  Click **New +** -> **Web Service**.
4.  Data Source: **Connect a repository** -> Select your repo.
5.  **Settings**:
    *   **Name**: `techtribe-backend`
    *   **Region**: Closest to you.
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Plan**: Free
6.  **Environment Variables**:
    *   `PORT`: `10000`
    *   `DB_HOST`: (Host from Aiven/TiDB)
    *   `DB_USER`: (User from Aiven/TiDB)
    *   `DB_PASS`: (Password from Aiven/TiDB)
    *   `DB_NAME`: `defaultdb` (for Aiven) or `teamup` (for TiDB)
    *   `DB_PORT`: `1xxxx` (Aiven ports are usually 5 digits, e.g., 26543. TiDB is 4000)
    *   `JWT_SECRET`: (create a random secret)
7.  Click **Create Web Service**.
8.  Wait for deploy. Copy your **Render Backend URL**.

---

## Part 3: Keep it Alive (Important!)

Render's free tier sleeps after 15 minutes. To fix this:

1.  Go to [UptimeRobot](https://uptimerobot.com/) (Free).
2.  **Add New Monitor**.
    *   **Monitor Type**: HTTP(s)
    *   **Friendly Name**: TechTribe Backend
    *   **URL**: `https://techtribe-backend.onrender.com/config` (or just the root `/`).
    *   **Monitoring Interval**: **5 minutes** (Important! This prevents the 15-min sleep).
3.  Start the monitor.
    *   *Result*: UptimeRobot will ping your server every 5 minutes, tricking Render into thinking it's busy, so it stays running 24/7.

---

## Part 4: Frontend (Vercel)

1.  Go to [Vercel](https://vercel.com).
2.  **Add New Project** -> Import your Git repo.
3.  **Root Directory**: Click Edit -> Select `Frontend`.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Paste your **Render Backend URL** (no trailing slash).
5.  Click **Deploy**.

---

## Troubleshooting

*   **Database Connection**:
    *   **Aiven**: Just works. Ensure you copy the Host, Port, User, Password correctly. Note that Aiven requires SSL often, but `mysql2` usually handles it or you might need to add `ssl: { rejectUnauthorized: false }` in your `db.js` if it fails.
    *   **TiDB**: Ensure you add `0.0.0.0/0` to the IP Access List in TiDB dashboard.
