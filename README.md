# Common Campus Events

A full-stack college event management system built with React, Vite, Spring Boot 3, Java 17, Spring Data JPA, Spring Security, JWT, Maven, and MySQL.

## Features

- Student registration and JWT login; role-based student/admin access.
- Public upcoming-event calendar with search, category filters, and event details.
- Student event registration, capacity checks, personal registration list, and cancellation.
- Admin dashboard statistics, event create/edit/delete, and registration management.
- Server-side validation, DTO-based REST responses, database constraints, responsive layouts, loading/error states, and delete confirmations.

## Requirements

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8+

## Configuration

Create the database (Spring can also create it when the configured account has that permission):

```sql
CREATE DATABASE college_event_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Set the backend values in `backend/.env` (copy `backend/.env.example`) or provide them as environment variables in the deployment environment. Spring imports the local `.env` file when it exists. Set `DATABASE_URL` to the target database:

```text
jdbc:mysql://localhost:3306/college_event_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

Set `MYSQL_USERNAME` and `MYSQL_PASSWORD` to credentials for a MySQL user that can create/modify the configured database. Set a strong random `JWT_SECRET` and replace `ADMIN_PASSWORD` before running the application. Generate independent Base64-encoded keys for `JWT_SECRET` and `CREDENTIAL_ENCRYPTION_KEY` with PowerShell:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)
```

`CREDENTIAL_ENCRYPTION_KEY` must decode to exactly 32 bytes. Existing credential passwords saved by earlier versions used a hardcoded, unauthenticated cipher and cannot be migrated safely; re-enter those passwords after updating the app. Local `.env` files are ignored by Git.

`JPA_DDL_AUTO` defaults to `update` for local development. For production, use versioned schema migrations and set it to `validate`.

## Run locally

The backend is a Java/Spring Boot Maven project. It does not need a `package.json`; run it with Maven from `backend/`:

```powershell
cd backend
Copy-Item .env.example .env # One-time setup; edit .env before starting.
mvn spring-boot:run
```

The backend listens on `http://localhost:8080`. At startup it creates the configured administrator if the email does not exist, or promotes that configured account to `ADMIN`. Student accounts are created from the Register page and cannot self-select the admin role.

Start the frontend in a second terminal from `frontend/`:

```powershell
cd frontend
npm install
Copy-Item .env.example .env # One-time setup; set VITE_API_PROXY_TARGET.
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` and set the backend origin in `VITE_API_PROXY_TARGET`. Vite proxies `/api` to that server, so the browser uses a same-origin API path and avoids local CORS issues. Open the URL printed by Vite, normally `http://localhost:5173`.

For production, set `VITE_API_BASE_URL` at frontend build time. Use `/api` when a reverse proxy routes API requests to Spring, or set it to the public API URL and configure `CORS_ALLOWED_ORIGINS` in the backend. Vite `VITE_*` values are public and must never contain secrets.

## REST API

All routes use the `/api` prefix. Login returns a JWT; authenticated requests send `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Authenticate and receive JWT |
| GET | `/api/user/me` | Authenticated | View current profile |
| GET | `/api/events?search=&category=&upcoming=true` | Public | Search and browse events |
| GET | `/api/events/{id}` | Public | Event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/{id}` | Admin | Update event |
| DELETE | `/api/events/{id}` | Admin | Delete event and registrations |
| POST | `/api/events/{id}/register` | Student | Register for event |
| DELETE | `/api/events/{id}/register` | Student | Cancel own registration |
| GET | `/api/registrations/my` | Student | List own registrations |
| GET | `/api/admin/registrations` | Admin | List all registrations |
| DELETE | `/api/admin/registrations/{id}` | Admin | Remove registration |
| GET | `/api/admin/stats` | Admin | Dashboard totals |

## Verify builds

```powershell
cd backend
mvn test
cd ..\frontend
npm run build
```

## Presentation summary

Common Campus Events centralizes college activities in a searchable calendar. Students can discover an event, review its details, reserve a place, and manage their registrations. Administrators manage the event catalogue and attendee lists from a dashboard with live counts. The Spring Boot API enforces access by role, validates event data, prevents duplicate registrations, and uses a transactional capacity check so event limits remain consistent. MySQL stores users, events, and registrations with relational constraints, while the React interface adapts to phones, tablets, and desktop screens.
