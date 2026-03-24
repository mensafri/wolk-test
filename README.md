# Dota 2 Draft Plans

A fullstack application for planning Dota 2 drafts. Built as a take-home assessment.

## Features

- Create and manage draft plans.
- Add and remove heroes from Ban Lists and Preferred Picks.
- Track Enemy Threats and Item Timings.
- View a comprehensive Draft Summary.

## Local Setup (Max 5 Steps)

This application is fully Dockerized. You do not need to install Node.js locally (only Docker is required). The build, database migration, and seeding processes will run automatically when the containers are started for the first time.

1. **Ensure Docker and Docker Compose are installed and running** on your machine.
2. Clone this repository and navigate to the application's root directory.
3. Run the following command to build and start all services (Database, Backend, and Frontend):
   ```bash
   docker-compose up -d --build
   ```
4. Wait approximately 1-2 minutes for the build process to complete and for the `backend` container to automatically run database migrations and seeding.
5. Open your browser and access the application at **http://localhost** (port 80).
   - *Test User Login:*
     - Username: `testuser`
     - Password: `password123`

_E2E Testing Note (Optional):_
If you wish to run End-to-End tests using Playwright (requires local Node.js), execute the following commands:
```bash
npm install -D @playwright/test
npx playwright test
```
