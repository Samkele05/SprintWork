# SprintWork Platform

A rebuilt local platform based on the SprintWork project design. This repository now includes a local backend API and a Vite + React frontend.

## Run locally

1. Install dependencies:
```powershell
npm install
```
2. Start the development server and local backend together:
```powershell
npm run dev
```
3. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Build and preview

1. Build the frontend:
```powershell
npm run build
```
2. Start the backend server to serve the production build:
```powershell
npm start
```

## Notes

- API requests are proxied to the local Express backend during development.
- The app now persists data in a local `data/db.json` store.
- Use `npm run build` to create the production build in `dist/`.
