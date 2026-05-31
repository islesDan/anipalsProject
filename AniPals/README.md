# AniPals

AniPals is split into two apps:

```text
frontend/   Vite React frontend
backend/    Spring Boot backend
```

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend also includes `docker-compose.yml` for local services such as the database.
