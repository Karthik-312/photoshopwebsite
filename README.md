# Spandana Photo House

> **30+ years of photography excellence | 2000+ events captured | Ongole, Andhra Pradesh**

A full-stack photography studio website with online booking, Razorpay payments, email & SMS notifications, Google Reviews integration, client ratings, and a secure admin dashboard.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Admin Dashboard](#-admin-dashboard)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## Features

### Core

| Feature | Description |
|---------|-------------|
| **Booking System** | Clients book sessions with event type, package, preferred date, and notes |
| **Online Payment** | Razorpay integration — UPI, cards, net banking, Google Pay |
| **Email Notifications** | Automatic styled emails to studio + customer on every booking |
| **SMS Notifications** | Fast2SMS integration for instant mobile alerts |
| **Google Reviews** | Live reviews fetched from Google Places API with caching |
| **Client Ratings** | On-site star rating system with distribution charts |
| **Admin Dashboard** | Password-protected panel to view bookings, contacts, ratings |
| **CSV Export** | Export all admin data to CSV with one click |
| **Contact Form** | Clients can send messages directly through the website |

### Frontend

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Looks great on desktop, tablet, and mobile |
| **Dark / Light Theme** | Toggle between themes, persisted in localStorage |
| **Portfolio Gallery** | Filterable grid with fullscreen lightbox |
| **Before & After Slider** | Interactive drag-to-compare for photo restoration |
| **Testimonial Carousel** | Auto-advancing client testimonials |
| **WhatsApp Chat** | Floating WhatsApp button for instant messaging |
| **Site Search** | In-page search overlay for services, FAQ, and portfolio |
| **Smooth Animations** | Scroll-triggered animations and transitions |

### Security & Reliability

| Feature | Description |
|---------|-------------|
| **Payment Verification** | Server-side HMAC-SHA256 signature verification for Razorpay |
| **Persistent Database** | File-based H2 — data survives server restarts |
| **Input Validation** | 10-digit phone validation, date restrictions, required fields |
| **Async Notifications** | Email/SMS sent in background threads — never blocks the user |
| **Admin Auth** | Password-protected API endpoints |

---

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Data JPA** — ORM and repository pattern
- **Spring Boot Mail** — Gmail SMTP email notifications
- **H2 Database** — embedded, file-based persistence
- **Gradle** — build tool with JaCoCo test coverage
- **JaCoCo** — code coverage reports

### Frontend
- **React 18** + **Vite** — fast dev server and optimized builds
- **React Router** — client-side SPA routing
- **CSS** — custom properties, responsive grid, dark/light themes
- **Font Awesome** — icons throughout the UI

### Integrations
- **Razorpay** — payment gateway (test + live modes)
- **Google Places API** — live Google Reviews
- **Fast2SMS** — SMS notifications for Indian mobile numbers
- **Gmail SMTP** — transactional emails

---

## Project Structure

```
spandana-photo-house/
├── src/
│   ├── main/
│   │   ├── java/com/spandana/photohouse/
│   │   │   ├── PhotoHouseApplication.java        # Entry point
│   │   │   ├── WebConfig.java                    # SPA route forwarding
│   │   │   ├── controller/
│   │   │   │   ├── BookingController.java        # POST /api/booking
│   │   │   │   ├── ContactController.java        # POST /api/contact
│   │   │   │   ├── RatingController.java         # GET/POST /api/ratings
│   │   │   │   ├── AdminController.java          # GET /api/admin/*
│   │   │   │   ├── PaymentController.java        # POST /api/payment/*
│   │   │   │   └── GoogleReviewsController.java  # GET /api/google-reviews
│   │   │   ├── model/
│   │   │   │   ├── Booking.java                  # Booking entity
│   │   │   │   ├── ContactSubmission.java        # Contact form entity
│   │   │   │   └── Rating.java                   # Rating entity
│   │   │   ├── repository/
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── ContactSubmissionRepository.java
│   │   │   │   └── RatingRepository.java
│   │   │   └── service/
│   │   │       ├── NotificationService.java      # Email + SMS
│   │   │       └── RatingService.java            # Rating aggregation
│   │   └── resources/
│   │       ├── application.properties            # All configuration
│   │       └── static/                           # Built frontend assets
│   └── test/                                     # Unit & integration tests
├── frontend/
│   └── src/
│       ├── App.jsx                               # Main React application
│       ├── api.js                                # Backend API client
│       ├── config.js                             # Site configuration
│       ├── main.jsx                              # React entry point
│       └── styles.css                            # All styles
├── build.gradle                                  # Gradle build config
├── reports/jacoco/                               # Test coverage reports
└── README.md
```

---

## Getting Started

### Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Node.js 18+** — [Download](https://nodejs.org/) (for frontend build)
- **Gradle** — included via wrapper (`./gradlew`)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd spandana-photo-house
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Run the Application

```bash
# Windows
.\gradlew.bat bootRun

# macOS / Linux
./gradlew bootRun
```

The app starts at **http://localhost:8080**

### 4. Access Admin Dashboard

Navigate to **http://localhost:8080/admin**

Default password: `admin123` (change in `application.properties`)

---

## Configuration

All settings live in `src/main/resources/application.properties`:

### Database

```properties
# File-based H2 (data persists across restarts)
spring.datasource.url=jdbc:h2:file:${user.home}/.spandana-db/photohouse;DB_CLOSE_ON_EXIT=FALSE
spring.jpa.hibernate.ddl-auto=update
```

### Email Notifications (Gmail)

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Generate an App Password for "Mail"
3. Update the properties:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### SMS Notifications (Fast2SMS)

1. Sign up at [fast2sms.com](https://www.fast2sms.com)
2. Copy your API key from the dashboard

```properties
app.sms.enabled=true
app.sms.api-key=your-fast2sms-api-key
```

### Online Payments (Razorpay)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API keys from **Dashboard > Settings > API Keys**
3. Use `rzp_test_*` keys for testing

```properties
app.razorpay.key-id=rzp_test_xxxxxxxxxxxx
app.razorpay.key-secret=your-secret-key
app.razorpay.advance-amount=1000
```

### Google Reviews

1. Enable **Places API** in [Google Cloud Console](https://console.cloud.google.com)
2. Create an API key
3. Find your Place ID at [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

```properties
app.google.places.api-key=your-google-api-key
app.google.places.place-id=ChIJ_your_place_id
```

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ratings` | Get average rating, distribution, recent reviews |
| `POST` | `/api/ratings` | Submit a new star rating |
| `POST` | `/api/booking` | Submit a booking request |
| `POST` | `/api/contact` | Submit a contact form message |
| `GET` | `/api/google-reviews` | Fetch cached Google Reviews |
| `GET` | `/api/payment/config` | Check if payment is enabled + get public key |
| `POST` | `/api/payment/create-order` | Create a Razorpay order |
| `POST` | `/api/payment/verify` | Verify payment and save booking |

### Admin Endpoints (require `X-Admin-Password` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/ratings` | All ratings with details |
| `GET` | `/api/admin/contacts` | All contact submissions |
| `GET` | `/api/admin/bookings` | All bookings with payment status |

---

## Admin Dashboard

Access at `/admin` — features include:

- **Ratings Tab** — view all client ratings with timestamps
- **Contacts Tab** — view all contact form submissions
- **Bookings Tab** — view all bookings with payment status badges (PAID / NONE)
- **CSV Export** — download any tab's data as a spreadsheet
- **Payment Tracking** — see Razorpay payment IDs for paid bookings

---

## Testing

### Run Tests

```bash
# Run all tests
.\gradlew.bat test

# Run with coverage report
.\gradlew.bat test jacocoTestReport
```

### View Coverage Report

Open `reports/jacoco/index.html` in your browser after running tests.

### Test Files

```
src/test/java/com/spandana/photohouse/
├── PhotoHouseApplicationTest.java
├── controller/
│   ├── AdminControllerTest.java
│   ├── BookingControllerTest.java
│   └── ContactControllerTest.java
├── model/
│   ├── BookingTest.java
│   ├── ContactSubmissionTest.java
│   └── RatingTest.java
├── repository/
│   ├── BookingRepositoryTest.java
│   ├── ContactSubmissionRepositoryTest.java
│   └── RatingRepositoryTest.java
└── service/
    └── RatingServiceTest.java
```

---

## Deployment

### Option 1: Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and connect your repo
3. Set environment variables for email, SMS, Razorpay, Google keys
4. Deploy — Railway auto-detects Gradle and builds

### Option 2: Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `./gradlew bootJar`
4. Set start command: `java -jar build/libs/photohouse-1.0.0.jar`

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Build the JAR
./gradlew bootJar

# Copy to server and run
java -jar build/libs/photohouse-1.0.0.jar --server.port=80
```

### Production Checklist

- [ ] Change `app.admin.password` from default
- [ ] Set Gmail App Password for email notifications
- [ ] Configure Fast2SMS API key for SMS
- [ ] Switch Razorpay from test keys to live keys
- [ ] Add Google Places API key for reviews
- [ ] Set up a custom domain
- [ ] Enable HTTPS (most platforms handle this automatically)
- [ ] Consider migrating H2 to PostgreSQL/MySQL for production scale

---

## Screenshots

| Page | Description |
|------|-------------|
| **Homepage** | Hero section with ratings badge, trust marquee, and CTAs |
| **Portfolio** | Filterable gallery with lightbox viewer |
| **Booking** | Form with optional Razorpay advance payment |
| **Ratings** | Star distribution chart with recent reviews |
| **Google Reviews** | Live reviews pulled from Google Maps |
| **Admin** | Dashboard with tabs for bookings, contacts, ratings |

---

## License

This project is proprietary to **Spandana Photo House**, Ongole, A.P.

---

<p align="center">
  <strong>SPANDANA PHOTO HOUSE</strong><br/>
  Near Mastan Durga Center, Trunk Road, Ongole - 523 001, A.P.<br/>
  Phone: 8121046903 | Email: dvr.spandana@gmail.com
</p>
