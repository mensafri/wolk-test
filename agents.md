# Fullstack Engineer - Take Home Assesment

## What you need to build

Build a small Dota 2 “Draft Plans” app (web with React/Svelte or mobile with Flutter) where a user can create draft plans and fill them with heroes to Ban and heroes to Prefer. A “draft plan” is just a named plan that stores two lists of heroes: a Ban List and a Preferred Picks list.

## Tasks

- The app must have a “Draft Plans” list screen that shows all created draft plans and a button to create a new one.
- The app must allow creating a draft plan by entering a name (description is optional), and after creation, the user must be able to open that plan.
- The app must have a “Draft Plan Detail” screen that shows the selected plan and two sections: “Ban List” and “Preferred Picks”
- The app must have a “Hero Browser” screen (or modal) that shows a list of Dota 2 heroes loaded from OpenDota (not hardcoded), and lets the user add a hero to either the Ban List or the Preferred Picks of the currently opened draft plan.
- The user must be able to remove heroes from the Ban List and from the Preferred Picks list.
- For each hero added to the Ban List, the user must be able to add/edit an optional free-text note.
- For each hero added to the Preferred Picks list, the user must be able to set Role (text or fixed options), Priority High/Medium/Low), and an optional free-text note.
- All draft plans and their contents must be persisted in the database so that refreshing/reopening the app keeps the same draft plans and lists.
- Hero entries stored in a draft plan must reference heroes by an OpenDota identifier (e.g., hero ID), not just by storing the hero name string.
- The app must allow each draft plan to define a list of Enemy Threats / Counters, consisting of enemy heroes the team wants to respond to or counter. For each enemy hero, the user must be able to add/edit an optional free-text note describing how or why the hero is a threat.
- The app must allow attaching Item Timing Notes to a draft plan. Each timing note must include a key item timing (e.g., “BKB ~18 min”) and a short explanation describing why the timing is important to the plan.
- The app must provide a Draft Summary view for each draft plan. The summary must be read-only and present a concise, aggregated overview of the plan (including bans, preferred picks, roles, priorities, enemy threats, and item timings), optimized for quick scanning during the draft phase or discussions.

## References:

1. https://www.opendota.com/api-keys

## Backend Setup

This take-home requires a local backend setup. Choose one of the following:

- Build a dedicated backend API (any language/framework) and package everything using docker-compose.yml with:
  - PostgreSQL database (required)
  - Backend API service
  - Frontend application service
- Use Supabase locally as the backend platform.

## References:

- https://supabase.com/docs/guides/local-development
- https://docs.docker.com/compose/

## Required Deliverables

- Source code of the full solution.
- A README.md explaining local setup in a maximum of 5 steps.
- A schema.dbml file containing an ERD in DbML syntax (dbdiagram format).
- Database migration files (whether using Supabase migrations or backend migrations).
- A database seed script.
- One command to initialize and populate the local database (migrate + seed) regardless of whether the database runs via Docker Postgres or Supabase local.
- The .git directory must be included in the submission so the commit history is visible.
- A DESIGN.md file that describes the system plan and reasoning:
  - Planned pages/screens and routing structure.
  - State management approach and why React hooks, Redux, Bloc, etc.).
  - Data flow overview: UI → API → DB, including what data comes from API vs what is persisted locally.
  - Error handling approach.
  - What was intentionally not built and why?
- An AI_LOG.md file documenting AI usage (even if AI was not used):
  - AI tool(s) used (if any).
  - At a minimum, include 4 prompt records:
    - The first prompt.
    - The number of iterations taken to reach an accepted result.
    - The final prompt or accepted output.
  - A short note describing what the prompts were used for (e.g. scaffolding, debugging, refactoring, tests).
  - If custom AI instructions or agent files were used, include them and list them:
    - agents.md, skills.md, or equivalent custom instruction files.
  - If AI was not used, explicitly state that in AI_LOG.md.
- In the follow-up interview, we may ask you to walk through architectural choices, data flow, and specific parts of the code; clarity of explanation will impact evaluation.

## Submission Format

Submit a single ZIP file containing the full project and all required deliverables, including the .git directory.

⚠️ Candidates are responsible for verifying that all required deliverables are included in the submitted ZIP file. Incomplete submissions may negatively impact the evaluation outcome and progression to the next stage.

## Bonus (Optional)

- Implementing a self-built backend API (instead of Supabase) is considered a bonus.
- Reduce repeated external API calls using server-side caching in PostgreSQL only (no Redis/Memcached, no client-side caching like localStorage).
- Demonstrate handling a long-running task using PostgreSQL only (no dedicated message queue tools).
- Use Supabase Edge Functions in a meaningful way.
- Add authentication and ensure users can only access their own records.
- Add end-to-end tests (tooling is up to the candidate).
