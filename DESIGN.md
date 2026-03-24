# System Design

## Architecture
The system follows a classic decoupled 3-tier architecture:
1. **Frontend**: React SPA using Vite, TypeScript, and TailwindCSS.
2. **Backend**: Express + Node.js REST API providing routes to fetch and save data.
3. **Database**: PostgreSQL 15 running in a Docker container, managed by Prisma ORM.

## Planned Pages / Screens and Routing Structure
1. **`/` (DraftPlansList)**: Displays a grid of existing draft plans from the database. Also includes a form to create a new plan (Name + optional description).
2. **`/draft/:id` (DraftPlanDetail)**: The main operational dashboard for a draft plan. Includes two column layout focusing on Hero drafting (left) and strategy/items (right).
   - "Ban List" & "Preferred Picks" areas
   - "Enemy Threats" List
   - "Item Timings" Form and List
   - A modal `<HeroBrowser>` triggered from Add buttons to load available Dota 2 heroes.
   - A `<DraftSummaryModal>` triggered by the "View Summary" button to show the aggregated read-only view.

## State Management Approach
For state management, we chose a primarily Server-State routing approach via **React Query (`@tanstack/react-query`)**:
- **Why?** Our application data lives entirely connected to our Database. Global state managers like Redux or Zustand would introduce unnecessary boilerplate to synchronize local states with the REST API.
- React Query handles caching, background refreshing, and mutation invalidation seamlessly. Meaning when a Hero is added, a simple `invalidateQueries` accurately forces a re-render pulling the latest source-of-truth from PostgreSQL.
- Only ephemeral UI UI state (`showSummary`, `searchFilter`, etc) is kept in standard `useState()` React hooks.

## Data Flow (UI -> API -> DB)
1. User clicks "+ Add Ban" opening the Hero Browser.
2. The UI calls GET `/api/heroes` using React Query.
3. The Backend checks the `HeroCache` table in PostgreSQL. If the cache is newer than 24 hours, it returns it instantly. Otherwise, it proxies `https://api.opendota.com/api/heroes`, massages the format, bulk upserts it to Postgres, and returns the list to the UI (Bonus requirement: Server-Side Postgres Cache).
4. User selects a hero. The UI fires a `useMutation` calling `POST /api/draft-plans/:id/heroes`.
5. The API receives the payload, inserts a `ListHero` record into `PostgreSQL` via Prisma Client linking the `DraftPlan` id and `Hero` openDota ID.
6. The Mutation success callback invalidates the `['draft-plan', id]` query cache. React Query fetches the new payload, updating the UI.

## Error Handling
- **Backend Error Handling**: Basic 400 validations for Missing fields. Prisma errors usually trigger a 500 error gracefully returned with standard string formatting.
- **Frontend Error Handling**: Mutations handle visual disable loading states during asynchronous tasks. Data fetching will show loading or fallback text on UI component rendering.

## Intentionally Not Built & Why
- Over-engineered caching (Redis): Used Postgres-based caching to simplify the infrastructure architecture as requested for the bonus point, minimizing moving parts in Docker.
- Complex Form Libraries (`react-hook-form` or `formik`): Excluded because form shapes are simple (only string / enum bindings) and controlled inputs are sufficient, keeping bundle sizes small.
- Deep Role Based Access Control (Authentication): Excluded as authentication wasn't strictly required in the base scope.
