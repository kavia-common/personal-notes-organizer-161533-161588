# Notes Frontend (Remix)

Minimalistic light-themed notes app with authentication, CRUD, and search.

## Setup

1) Copy environment example and update values:
```bash
cp .env.example .env
# Set VITE_API_BASE_URL to your backend, e.g. http://localhost:8000
```

2) Install dependencies:
```bash
npm install
```

3) Run in development:
```bash
npm run dev
```

4) Build for production:
```bash
npm run build
npm start
```

## Environment Variables

- `VITE_API_BASE_URL` (required): Base URL of backend API.
- `VITE_API_WITH_CREDENTIALS` (default: true): Send cookies with requests.
- `VITE_APP_NAME` (default: Notes): Display name.

## Routes

- `/login` and `/signup`
- `/notes` layout with sidebar
  - `/notes` index placeholder
  - `/notes/new` POST action to create a note
  - `/notes/:id` view/edit/delete

## Backend Expectations

This frontend expects REST endpoints:
- POST `/auth/login` body: `{ email, password }` -> sets auth cookie
- POST `/auth/logout` -> clears auth cookie
- POST `/auth/signup` body: `{ email, password }`
- GET `/notes?q=...` -> `[ { id, title, content, createdAt, updatedAt } ]`
- POST `/notes` body: `{ title, content }` -> `{ id }`
- GET `/notes/:id` -> note
- PUT `/notes/:id` body: `{ title, content }`
- DELETE `/notes/:id`

All requests are sent to `${VITE_API_BASE_URL}` with `credentials: include` when enabled.
