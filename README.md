# Dota 2 Draft Plans App

A full-stack application for managing Dota 2 draft plans including ban lists, preferred picks, enemy threats, and item timings. Developed with React + Vite, Node.js + Express, Prisma, and PostgreSQL.

## Features Requirements Coverage
- Draft Plans List: Yes
- Create Draft Plan: Yes
- Draft Plan Detail (Bans, Preferred): Yes
- Hero Browser from OpenDota (Cached Server-Side): Yes
- Remove hero logic: Yes
- Custom Note for Bane/Threats/Picks: Yes
- Roles and Priority: Yes
- Persisted to DB with ID: Yes
- Item Timing Notes: Yes
- Draft Summary View: Yes
- PostgreSQL dedicated DB: Yes 

## Local Setup (Max 5 Steps)

1. **Install dependencies** (from root):
   ```bash
   cd backend && npm install && cd ../frontend && npm install
   ```
2. **Start the PostgreSQL database** (requires Docker):
   ```bash
   docker-compose up -d
   ```
3. **Initialize the Database**: Run migrations and seed the database.
   ```bash
   cd backend
   npm run db:init
   ```
4. **Start the Backend API**:
   ```bash
   # From backend folder
   npm run dev
   ```
5. **Start the Frontend App**: Open a new terminal.
   ```bash
   cd frontend
   npm run dev
   ```

Visit `http://localhost:5173` to view the running app.
