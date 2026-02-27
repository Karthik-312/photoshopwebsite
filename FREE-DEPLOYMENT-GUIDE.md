# 100% Free Deployment Guide — $0 Cost

Everything below is **completely free**. No credit card needed.

---

## What You Get for Free

| Service | Free Tier | What You Need |
|---------|-----------|---------------|
| **Supabase** | 500MB database, 50K users/month | Email signup |
| **Netlify** | 100GB bandwidth, unlimited sites | Email signup |
| **Vercel** | 100GB bandwidth | Email signup |
| **GitHub Pages** | 1GB storage, 100GB bandwidth | GitHub account (free) |

---

## Step 1: Create Supabase (2 minutes)

1. Go to **[supabase.com](https://supabase.com)** → Click **Start your project**
2. Sign up with **GitHub** or **Email** (no credit card)
3. Click **New Project** → Choose a name and password → **Create**
4. Wait ~2 minutes for the project to be ready

---

## Step 2: Create Database Tables (1 minute)

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `database-setup.sql` from this folder
4. Copy all the text and paste into the editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success"

---

## Step 3: Get Your Credentials (30 seconds)

1. Click **Project Settings** (gear icon, bottom left)
2. Click **API** in the menu
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

---

## Step 4: Add Credentials to Your Website

1. Open `config.js` in this folder
2. Find lines 10–11:
   ```javascript
   url: '',
   anonKey: ''
   ```
3. Paste your values:
   ```javascript
   url: 'https://YOUR-PROJECT-ID.supabase.co',
   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'
   ```
4. Save the file

---

## Step 5: Deploy to Netlify (2 minutes)

1. Go to **[netlify.com](https://netlify.com)** → Sign up (free)
2. Click **Add new site** → **Deploy manually**
3. **Drag and drop** this entire folder onto the page
4. Wait ~30 seconds
5. You'll get a link like `random-name-123.netlify.app`
6. Click it — your site is live!

**Optional:** In Netlify → Site settings → Change site name → Use `spandana-photo` to get `spandana-photo.netlify.app`

---

## Share Your Link

- Copy your Netlify link
- Share via **WhatsApp**, **SMS**, **Email**, or any app
- Works on **all phones** and **all devices**
- Ratings are stored and visible to everyone

---

## Alternative: Deploy to Vercel (Also Free)

1. Go to **[vercel.com](https://vercel.com)** → Sign up
2. Click **Add New** → **Project**
3. Import from GitHub, or drag this folder
4. Get your free link

---

## Alternative: GitHub Pages (Also Free)

1. Create a **[GitHub](https://github.com)** account
2. Create a new repository
3. Upload all files from this folder
4. Go to **Settings** → **Pages** → Source: **main** branch
5. Get link like `username.github.io/repo-name`

---

## Summary: Total Cost = $0

- Supabase free tier: Enough for thousands of ratings
- Netlify free tier: Enough for thousands of visitors
- No credit card, no payment, no hidden fees
