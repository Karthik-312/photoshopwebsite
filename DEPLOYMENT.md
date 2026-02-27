# How to Make Spandana Photo House Live

This guide covers options to deploy your application so it's accessible on the internet.

---

## Option 1: Railway (Easiest, Free Tier)

**Best for:** Quick deployment, minimal setup

1. **Sign up:** [railway.app](https://railway.app) (free account)
2. **Connect GitHub:** Push your code to GitHub, then connect the repo to Railway
3. **Configure build:**
   - Railway auto-detects Java/Spring Boot
   - Set **Build Command:** `./gradlew build`
   - Set **Start Command:** `java -jar build/libs/spandana-photo-house-1.0.0.jar`  
     (Or use the JAR path from `~/.gradle/builds/spandana-photo-house/libs/` if your buildDir is custom)
4. **Database:** Railway offers PostgreSQL. Add a PostgreSQL plugin, then set:
   - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
5. **Domain:** Railway gives a free `*.railway.app` URL. You can add a custom domain later.

**JAR path:** This project uses a custom `buildDir`. The JAR is at:
`$HOME/.gradle/builds/spandana-photo-house/libs/spandana-photo-house-1.0.0.jar`  
Use that path in your start command, or run `./gradlew bootJar` and check the output for the exact path.

---

## Option 2: Render

**Best for:** Simple Java hosting

1. **Sign up:** [render.com](https://render.com)
2. **New Web Service** → Connect your GitHub repo
3. **Build:** `./gradlew build`
4. **Start:** `java -jar build/libs/spandana-photo-house-1.0.0.jar`  
   (Adjust path if your JAR is elsewhere)
5. **Database:** Add Render PostgreSQL, set env vars for `SPRING_DATASOURCE_*`
6. **Free tier:** Sleeps after inactivity; first request may be slow

---

## Option 3: VPS (DigitalOcean, AWS EC2, etc.)

**Best for:** Full control, always-on server

1. **Create a VPS:** Ubuntu 22.04 (e.g. DigitalOcean Droplet, ~$5–6/month)
2. **Install Java 17:**
   ```bash
   sudo apt update && sudo apt install openjdk-17-jdk -y
   ```
3. **Build locally and upload JAR**, or build on server:
   ```bash
   git clone <your-repo>
   cd "photo shop website"
   ./gradlew build
   ```
4. **Run the app:**
   ```bash
   java -jar ~/.gradle/builds/spandana-photo-house/libs/spandana-photo-house-1.0.0.jar
   ```
5. **Use systemd** so it runs on boot:
   ```ini
   [Unit]
   Description=Spandana Photo House
   After=network.target

   [Service]
   User=ubuntu
   ExecStart=/usr/bin/java -jar /path/to/spandana-photo-house-1.0.0.jar
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
6. **Nginx** as reverse proxy (optional, for HTTPS):
   - Install Nginx, get SSL with Let's Encrypt (Certbot)
   - Proxy requests to `localhost:8080`

---

## Option 4: Heroku

1. **Sign up:** [heroku.com](https://heroku.com)
2. **Heroku CLI:** Install and run `heroku create`
3. **Procfile:** Create `Procfile` in project root:
   ```
   web: java -jar build/libs/spandana-photo-house-1.0.0.jar
   ```
4. **Build:** Heroku uses Gradle. Ensure JAR path matches your `buildDir` or add a `stage` task.
5. **Database:** Add Heroku Postgres add-on, set `DATABASE_URL`

---

## Before Going Live – Checklist

- [ ] **Change admin password** – Set `adminPassword` via environment variable, not in code
- [ ] **Database** – Switch from H2 to PostgreSQL/MySQL for production (H2 is in-memory, data is lost on restart)
- [ ] **HTTPS** – Use a platform that provides SSL (Railway, Render, Heroku do this automatically)
- [ ] **Environment variables** – Store secrets (DB URL, admin password) in env vars, not in config files
- [ ] **Build the frontend** – Run `cd frontend && npm run build` before deploying (or rely on Gradle `buildFrontend` task)

---

## Database for Production

Your app uses H2 by default. For production:

1. **Add PostgreSQL** (in `build.gradle`):
   ```gradle
   runtimeOnly 'org.postgresql:postgresql'
   ```

2. **Set environment variables:**
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
   SPRING_DATASOURCE_USERNAME=user
   SPRING_DATASOURCE_PASSWORD=password
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   ```

3. **Remove H2** from production (or keep it only for tests).

---

## Custom Domain

1. Buy a domain (e.g. Namecheap, GoDaddy, Google Domains)
2. Add a CNAME or A record pointing to your host (Railway/Render/VPS IP)
3. In your hosting dashboard, add the custom domain and enable SSL

---

## Quick Start (Railway Example)

```bash
# 1. Install Railway CLI (optional)
npm i -g @railway/cli

# 2. Login and init
railway login
railway init

# 3. Add PostgreSQL from Railway dashboard

# 4. Deploy
railway up
```

Your app will be live at `https://your-app.railway.app`.
