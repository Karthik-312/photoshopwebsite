# Java Backend (Spring Boot + Gradle)

The project now includes a **Java backend** using **Spring Boot** and **Gradle**.

## What Was Added

- **Gradle** build system (`build.gradle`, `settings.gradle`)
- **Spring Boot** application (Java 17)
- **REST API** for ratings and contact form
- **H2 database** (in-memory, no setup needed)
- **JPA entities** for Rating and ContactSubmission

## Project Structure

```
├── build.gradle
├── settings.gradle
├── src/main/java/com/spandana/photohouse/
│   ├── PhotoHouseApplication.java
│   ├── controller/
│   │   ├── RatingController.java    → GET/POST /api/ratings
│   │   └── ContactController.java   → POST /api/contact
│   ├── model/
│   │   ├── Rating.java
│   │   └── ContactSubmission.java
│   ├── repository/
│   │   ├── RatingRepository.java
│   │   └── ContactSubmissionRepository.java
│   └── service/
│       └── RatingService.java
└── src/main/resources/
    ├── application.properties
    └── static/          → index.html, styles.css, script.js, etc.
```

## How to Run

### Prerequisites
- **Java 17** or higher ([download](https://adoptium.net/))
- **Gradle** (or use the wrapper)

### Option 1: With Gradle installed
```bash
gradle bootRun
```

### Option 2: Generate wrapper first (one-time)
```bash
gradle wrapper
./gradlew bootRun       # Mac/Linux
gradlew.bat bootRun     # Windows
```

### Option 3: Build JAR and run
```bash
gradle build
java -jar out/libs/spandana-photo-house-1.0.0.jar
```

### If build fails (file lock / OneDrive)
Run the build script instead—it stops any running Java process first:
```powershell
.\build.ps1
```

## Access the Site

- **URL:** http://localhost:8080
- The Java backend serves the website and stores ratings in H2 (in-memory)
- **No Supabase needed** when using the Java backend
- Ratings and contact form work automatically

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ratings | Get rating stats and recent reviews |
| POST | /api/ratings | Submit a new rating |
| POST | /api/contact | Submit contact form |

## Database

- **H2** in-memory database (data resets when app restarts)
- For persistent storage, change `application.properties` to use PostgreSQL or MySQL

## Deployment

Deploy the JAR to **Railway**, **Render**, or **Heroku** (Java support). The app serves everything from a single JAR.
