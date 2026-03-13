# Spandana Photo House — React Frontend

This is the React.js frontend for the Spandana Photo House website.

## Development

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173. The Vite dev server proxies `/api` to the Spring Boot backend (http://localhost:8080).

**Run both for full dev experience:**
1. Terminal 1: `./gradlew bootRun` (Spring Boot on :8080)
2. Terminal 2: `cd frontend && npm run dev` (React on :5173)

## Build for Production

```bash
npm run build
```

Output goes to `src/main/resources/static/` so Spring Boot serves it.

Or build everything with Gradle:
```bash
./gradlew build
```
This runs `npm run build` in frontend first, then builds the Java app.

## Tech Stack

- React 18
- Vite 7
- React Router
- Font Awesome
- Same CSS design system as original
