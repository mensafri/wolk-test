# AI Usage Log

- **AI Tools Used**: Google Deepmind / Agentic Setup
- **Prompt Records**:
  - **Prompt 1**: "Pahami seluruh requirement di agents.md..." (Initial System Scaffolding)
    - Iterations: 1
    - Action: Scaffolded implementation plan, structured the backend schema, setup vite frontend.
  - **Prompt 2**: "Generate the core Express API routes and seed."
    - Iterations: 1
    - Action: Generated REST endpoints and Postgres schemas mapping to OpenDota hero IDs.
  - **Prompt 3**: "Build the Frontend React UI Pages"
    - Iterations: 2 (needed to fix Tailwind and Vite creation prompts)
    - Action: Created DraftPlansList and DraftPlanDetail with TailwindCSS UI.
  - **Prompt 4**: "Implement Draft Summary View and format deliverables"
    - Iterations: 1
    - Action: Created the final DraftSummaryModal and all required documentation artifacts.
  - **Prompt 5**: "di bonus ada yang bisa dikerjakan lagi yaitu ... lalu gimana kalau semuanya dijalankan di docker sekalian?"
    - Iterations: 1
    - Action: Implemented JWT Authentication, PostgreSQL atomic Job Queues (`SKIP LOCKED`), full Dockerization (Dockerfile Frontend & Backend), and Playwright E2E configurations.

- **Notes**: AI was used primarily for scaffolding React components, generating Express boilerplate, automatically translating `agents.md` requirements into a Prisma database schema, and drafting documentation blocks. AI successfully structured the Docker multi-container environment efficiently.
- **Custom Files Provided**: Evaluated strictly from `agents.md`.
