# Personal Digital Vault

A React + Vite and Spring Boot application for managing private files, notes, and encrypted login credentials. MySQL stores resource metadata and user accounts; file contents are stored under the backend's `uploads` directory.

## Requirements

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8+

## Configure

Create the database:

```sql
CREATE DATABASE personal_digital_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Copy `backend/.env.example` to `backend/.env`, then set the database password, JWT secret, and admin password. The template contains the complete backend configuration. Keep `JWT_SECRET` stable: it signs tokens and derives the key used to encrypt credential passwords.

`ADMIN_USERNAME` is an email address because login uses email. On startup, the configured account is created or promoted to administrator, and its password is synchronized from `ADMIN_PASSWORD`. Choose a strong password before running the backend.

## Run locally

Start the Spring Boot backend from its directory so Spring can load `backend/.env`:

```powershell
cd backend
Copy-Item .env.example .env # One-time setup; edit .env first.
mvn spring-boot:run
```

Start Vite in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is normally available at `http://localhost:5173` and the API at `http://localhost:8080`. Vite proxies `/api` to the backend during development. Set `VITE_API_BASE_URL` at frontend build time for a production API URL. Frontend `VITE_*` settings are public and must not contain secrets.

For production, provide the backend keys from `.env.example` through the deployment environment and use HTTPS. On an existing installation, apply `backend/db/migration/001_user_status_and_roles.sql` once before startup; set the production frontend's exact HTTPS origin in `application-prod.properties` or route the API through a same-origin reverse proxy. Start the jar with the `prod` profile to validate the managed schema instead of applying automatic updates:

```powershell
java -Dspring.profiles.active=prod -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Application features

- JWT sign-in, registration, protected routes, explicit sign-out, and role protected admin APIs.
- User dashboard with live personal file, note, and credential counts.
- Files: upload, search, preview, download, rename, and delete. Uploads are limited to 20 MB and a server-side type allowlist.
- Notes: create, search, edit, and delete.
- Credentials: encrypted at rest, masked in list responses, and revealed only on request.
- Profile editing and password change.
- Admin dashboard with aggregate counts and user administration, including role changes and account deactivation.
- Responsive soft blue and violet dashboard layout with loading, error, and empty states.

User-owned files, notes, and credentials are queried by both resource ID and authenticated owner. Administrators can view aggregate counts but do not automatically gain access to another user's private content. Deactivated accounts cannot authenticate. Admin APIs prevent demoting or deactivating the last active administrator.

## Important API routes

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET / PUT | `/api/user/me` | Authenticated |
| PUT | `/api/user/password` | Authenticated |
| GET / POST | `/api/files` / `/api/files/upload` | Authenticated, owner scoped |
| GET / PUT / DELETE | `/api/files/{id}` | Authenticated, owner scoped |
| GET | `/api/files/{id}/download` or `/preview` | Authenticated, owner scoped |
| GET / POST | `/api/notes` | Authenticated, owner scoped |
| PUT / DELETE | `/api/notes/{id}` | Authenticated, owner scoped |
| GET / POST | `/api/credentials` | Authenticated, owner scoped |
| GET | `/api/credentials/{id}/password` | Authenticated, owner scoped |
| GET | `/api/dashboard` | Authenticated, personal counts |
| GET | `/api/admin/vault-stats` | Admin |
| GET / POST | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/{id}` | Admin |

Authenticated requests use `Authorization: Bearer <token>`. The frontend keeps the stored `vault_token` when an API call returns `401`; it is removed only after explicit sign-out.

## Build and tests

```powershell
cd backend
mvn clean test
cd ..\frontend
npm run build
```
