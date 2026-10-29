# Getting Started & Local Development Setup

This guide walks you through setting up, configuring, and running **WorkOfHuman** locally from scratch.

---

## 1. Prerequisites

Ensure your development machine has the following tools installed:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended). Check with:
  ```bash
  node --version
  ```
- **npm**: `v10.x+` (bundled with Node.js). Check with:
  ```bash
  npm --version
  ```
- **PostgreSQL**: `v14+` database instance (either running locally or on a remote VPS/cloud service like AWS RDS, Supabase, Neon, or your private VPS).

---

## 2. Environment Variables Configuration

Copy the sample environment file to create your local `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure the parameters:

```bash
# PostgreSQL connection string
# Format: postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=prefer
DATABASE_URL="postgresql://postgres:YourSecurePassword@vps.amcmep.in:5432/workofhuman"

# Public URL of the frontend application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> [!NOTE]
> WorkOfHuman uses a dedicated schema named `workofhuman` within the database. The pool automatically scopes queries to this schema, so you can point multiple applications to the same PostgreSQL database instance without collisions.

---

## 3. Dependency Installation

Install all required production and development dependencies using `npm`:

```bash
npm install
```

This installs:
- Next.js 15, React 19, and TypeScript.
- PostgreSQL driver (`pg`) and types.
- UI libraries (Tailwind CSS v4, Framer Motion, Radix UI, Lucide Icons).
- Form and state utilities (React Hook Form, Zod, TanStack Query, Nuqs).

---

## 4. Initialize Database Schema & Starter Data

Run the database setup script to provision the `workofhuman` schema, all 12 tables, indexes, and initial editorial homepage copywriting:

```bash
npm run db:init
```

### Expected Output:
```text
Connecting to: postgresql://postgres:***@vps.amcmep.in:5432/workofhuman
Connected to PostgreSQL successfully.
Creating workofhuman schema and tables...
Schema and tables initialized successfully.
Seeding homepage settings...
Homepage settings seeded successfully.
Database setup complete.
```

---

## 5. Start the Development Server

Launch the Next.js development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

You will see the WorkOfHuman editorial homepage live.

---

## 6. Development Workflow & Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000`. |
| `npm run build` | Compiles optimized production bundle with TypeScript and route generation. |
| `npm start` | Runs the compiled production server. |
| `npm run lint` | Runs ESLint 9 checks across all source files. |
| `npm run db:init` | Executes schema migration and default seed data into PostgreSQL. |

---

## 7. Troubleshooting Common Setup Issues

### 1. `[PostgreSQL Pool Error]: connect ECONNREFUSED`
- **Cause**: The application cannot connect to the PostgreSQL host specified in `DATABASE_URL`.
- **Solution**:
  - Verify PostgreSQL is running (`sudo systemctl status postgresql` or Docker container status).
  - Check firewall permissions on port `5432` if connecting to a remote host.
  - Verify username, password, and database name in `.env`.

### 2. `Port 3000 is in use`
- **Cause**: Another dev server is occupying port 3000.
- **Solution**:
  - Next.js will automatically suggest running on port 3001 (`http://localhost:3001`).
  - Or terminate the previous process:
    ```bash
    lsof -i :3000
    kill -9 <PID>
    ```

### 3. `relation "projects" does not exist`
- **Cause**: The database tables have not been created yet.
- **Solution**: Run `npm run db:init` once from the repository root to apply `src/lib/db/schema.sql`.
