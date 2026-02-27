# Database Setup for Spandana Photo House

This guide explains how to set up the database so ratings from your website are stored and displayed.

## What Gets Stored

- **Ratings**: When visitors rate your service (1–5 stars) on phone or desktop, ratings are saved to the database.
- **Contact form**: Contact form submissions are also stored (optional).

## Setup Steps

### 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free)
3. Create a new project (choose a name and password)

### 2. Create the Database Tables

1. In your Supabase project, open **SQL Editor**
2. Click **New Query**
3. Copy the contents of `database-setup.sql`
4. Paste into the editor and click **Run**

### 3. Get Your API Credentials

1. Go to **Project Settings** (gear icon)
2. Open **API**
3. Copy:
   - **Project URL**
   - **anon public** key (under "Project API keys")

### 4. Configure Your Website (No File Editing)

1. Open your live website in a browser
2. Go to the **Ratings** section
3. Click **"Setup Database"**
4. Paste your Supabase URL and anon key
5. Click **Save & Connect** — the page will reload

Configuration is saved in your browser. No code editing needed.

### 5. Test

1. Open your website
2. Go to the **Ratings** section
3. Submit a rating (1–5 stars)
4. The rating should appear in the distribution and recent reviews

## Viewing Stored Data

In Supabase:

- **Table Editor** → `ratings` – all ratings
- **Table Editor** → `contact_submissions` – contact form entries

## Deploy & Share

Upload this folder to **Netlify**, **Vercel**, or **GitHub Pages** (all free). You'll get a link like `yoursite.netlify.app` that works on all phones.

## Troubleshooting

- **"Database not configured"**: Click "Setup Database" in the Ratings section and add your Supabase URL and key.
- **"No ratings yet"**: Run the SQL in `database-setup.sql` if you haven’t.
- **Ratings not showing**: Ensure the Supabase project is running and the anon key has access.
