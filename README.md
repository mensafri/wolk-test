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

Aplikasi ini sepenuhnya di-dockerize. Anda tidak perlu menginstall Node.js secara lokal (hanya Docker). Proses build, migration, dan seeding akan berjalan otomatis saat container pertama kali dijalankan.

1. **Pastikan Docker dan Docker Compose telah terinstall dan berjalan** di mesin Anda.
2. Clone repository ini dan masuk ke folder root aplikasi.
3. Jalankan perintah berikut untuk mem-build dan menjalankan seluruh services (Database, Backend, dan Frontend):
   ```bash
   docker-compose up -d --build
   ```
4. Tunggu sekitar 1-2 menit hingga proses build selesai dan container `backend` selesai menjalankan migrasi + seed database otomatis.
5. Buka browser dan akses aplikasi melalui **http://localhost** (port 80).
   - *Test User Login:*
     - Username: `testuser`
     - Password: `password123`

_Catatan E2E Test (Opsional):_
Jika Anda ingin mengetes End-to-End dengan Playwright (disyaratkan Node.js lokal), jalankan:
```bash
npm install -D @playwright/test
npx playwright test
```
