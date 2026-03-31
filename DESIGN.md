# System Design

## Architecture

The system follows a classic decoupled 3-tier architecture:

1. **Frontend**: React SPA using Vite, TypeScript, Tailwind CSS, React Router, and React Query.
2. **Backend**: Express + Node.js REST API handling authentication, draft-plan CRUD flows, OpenDota integration, and background processing.
3. **Database**: PostgreSQL 15 running in Docker, managed with Prisma ORM and Prisma migrations.

## Planned Pages / Screens and Routing Structure

1. **`/login`**
   - Sign in and sign up screen.
   - Stores JWT on successful login.
2. **`/` (DraftPlansList)**
   - Displays all draft plans for the authenticated user.
   - Includes a create-plan form.
   - Shows quick aggregate counts for bans, preferred picks, threats, and timings.
3. **`/draft/:id` (DraftPlanDetail)**
   - Operational page for a single draft plan.
   - Tabbed structure:
     - Ban List
     - Preferred Picks
     - Enemy Threats
     - Key Timings
     - Draft Summary
   - Uses a modal `<HeroBrowser>` for selecting heroes from OpenDota-backed data.

## Visual Identity & Design System

The application uses a **Tactical Esports Dashboard** visual language implemented with **Tailwind CSS v4** and custom design tokens defined in `frontend/src/index.css`.

- Primary: Burnt Orange
- Secondary: Blue
- Background: Deep Navy / Black
- Layout goal: dense, tactical, and readable during fast decision-making

The interface intentionally avoids generic prebuilt dashboard kits so the product feels closer to a strategy board than a default admin panel.

## State Management Approach

The app uses a server-state-first approach with **React Query (`@tanstack/react-query`)**.

### Why React Query

- Most meaningful state in this app lives on the backend and database.
- Draft plans, hero metadata, threats, and timings all need refresh/invalidation semantics.
- React Query reduces manual fetch orchestration and keeps query invalidation explicit.

### Current implementation

- `DraftPlansList` uses `useQuery` for fetching plans and `useMutation` for creation.
- `DraftPlanDetail` uses `useQuery` for plan details and hero metadata, plus `useMutation` for all add/update/delete operations.
- Only ephemeral UI state remains in local React state:
  - active tab
  - modal open/close state
  - local timing form fields
  - auth form state

## Data Flow (UI -> API -> DB)

### Hero selection flow

1. User clicks `Add Ban`, `Add Pick`, or `Add Threat`.
2. `HeroBrowser` reads hero data from the React Query `['heroes']` cache.
3. The frontend gets hero metadata from `GET /api/heroes`.
4. Backend checks `HeroCache` in PostgreSQL.
5. If cache is fresh and complete, it returns cached rows immediately.
6. Otherwise, backend fetches from `https://api.opendota.com/api/heroStats`, maps the data, stores it in PostgreSQL, and returns it.
7. User selects a hero.
8. Frontend triggers a mutation such as:
   - `POST /api/draft-plans/:id/heroes`
   - `POST /api/draft-plans/:id/threats`
9. Backend persists the row in PostgreSQL via Prisma.
10. Mutation success invalidates the relevant React Query keys:
   - `['draft-plan', id]`
   - `['draft-plans']`

### Item timing flow

1. User submits a timing string and explanation.
2. Frontend calls `POST /api/draft-plans/:id/item-timings`.
3. Backend inserts an `ItemTiming` row.
4. React Query invalidates draft-plan and list queries.

### Authentication flow

1. User logs in with username/password.
2. Backend validates password hash and issues JWT.
3. Frontend stores JWT in `localStorage`.
4. Axios interceptor injects `Authorization: Bearer <token>` into API calls.
5. Backend middleware validates JWT and scopes data access to the current user.

## Domain Model Overview

### Core entities

- **User**
  - Owns draft plans.
- **DraftPlan**
  - Central aggregate root.
- **ListHero**
  - Stores both bans and preferred picks, differentiated by `type`.
- **EnemyThreat**
  - Stores opposing heroes that require a response plan.
- **ItemTiming**
  - Stores key timing notes and explanations.
- **HeroCache**
  - Stores hero metadata from OpenDota, including `imageUrl`.
- **JobQueue**
  - Stores PostgreSQL-backed background jobs.

### Modeling decision

Heroes are stored by **OpenDota hero ID**, not by raw hero name string. That keeps the model stable and lets the UI resolve names and portraits from cached metadata.

## Background Processing

The app includes a PostgreSQL-backed background worker as a bonus feature.

- When a draft plan is created, the backend inserts a `JobQueue` row of type `ANALYZE_SYNERGY`.
- A polling worker claims one pending job using `FOR UPDATE SKIP LOCKED`.
- The worker simulates a long-running analysis task.
- The result is written back to `DraftPlan.synergyNote`.

This demonstrates a long-running task implementation using PostgreSQL only, without Redis or a dedicated queue service.

## Error Handling

### Backend

- Basic request guards for missing required fields.
- Ownership checks on draft-plan child mutations.
- Graceful 401 / 403 / 404 handling where applicable.
- Fallback to cached hero data if OpenDota fetch fails but cached data exists.

### Frontend

- Query loading states for list/detail data.
- Mutation loading state on create-plan and add-timing flows.
- Basic inline error messaging on login and plan creation.
- Fallback hero rendering if an image is missing or fails to load.

## Security / Ownership

Authentication was implemented as a bonus feature and is part of the actual system.

- Each draft plan belongs to a specific user.
- List and detail queries are scoped to the authenticated user.
- Child mutations now verify ownership before update/delete/insert flows tied to a parent draft plan.

This is still lightweight authentication, not full RBAC or hardened production auth.

## Intentionally Not Built & Why

- **Full production auth hardening**
  - JWT in `localStorage` is acceptable for a take-home but would be revisited for production.
- **Dedicated background queue infrastructure**
  - PostgreSQL-only background processing was chosen because it satisfied the bonus requirement while keeping infrastructure simple.
- **Heavy form libraries**
  - The forms are relatively small, so plain controlled inputs were sufficient.
- **Full backend modularization**
  - The backend still centralizes several concerns in one entry file. For this project scope, that kept delivery faster, but the next refactor would split routes, services, and worker code.
- **Comprehensive automated test suite**
  - The project includes Playwright E2E coverage for the primary flow, but not a full unit/integration test matrix.
