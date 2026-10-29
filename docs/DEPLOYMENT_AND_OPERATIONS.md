# Deployment & Production Operations

This document covers production deployment workflows, database provisioning, environment management, and operational maintenance for **WorkOfHuman**.

---

## 1. Production Requirements

- **Node.js**: `20.x` or `22.x` (LTS)
- **Memory**: Minimum 1 GB RAM (2 GB recommended for build step)
- **PostgreSQL**: Version 14 or newer with persistent storage and connection pooling
- **Network**: Port 3000 (app internal) / Port 80 & 443 (reverse proxy)

---

## 2. Deployment Option A: Cloud Platform (Vercel)

WorkOfHuman is natively optimized for Vercel deployment:

### Step 1: Connect Git Repository
1. Import the repository in your Vercel Dashboard.
2. Framework Preset will auto-detect as **Next.js**.

### Step 2: Configure Environment Variables
Add the following under **Project Settings &rarr; Environment Variables**:

| Variable | Value Example | Environment |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/workofhuman?sslmode=require` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://workofhuman.com` | Production |

### Step 3: Run Database Initialization
Before triggering the first build, run the initialization script once against your production PostgreSQL instance:
```bash
DATABASE_URL="<production-connection-string>" npm run db:init
```

### Step 4: Deploy
Click **Deploy**. Next.js App Router will compile Server Components and optimize static routes.

---

## 3. Deployment Option B: Self-Hosted VPS / Linux Server

To run WorkOfHuman on your Ubuntu/Debian VPS (e.g. `vps.amcmep.in`):

### Step 1: Install Node.js 22 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### Step 2: Clone & Configure
```bash
cd /var/www
git clone https://github.com/your-org/workofhuman.git
cd workofhuman
npm install
```

Create production `.env`:
```bash
DATABASE_URL="postgresql://postgres:YourSecurePassword@localhost:5432/workofhuman"
NEXT_PUBLIC_APP_URL="https://workofhuman.com"
NODE_ENV="production"
```

Initialize database:
```bash
npm run db:init
```

### Step 3: Build & Run with PM2
Install PM2 process manager:
```bash
sudo npm install -g pm2
npm run build
pm2 start npm --name "workofhuman" -- start
pm2 save
pm2 startup
```

### Step 4: Nginx Reverse Proxy & SSL
Configure `/etc/nginx/sites-available/workofhuman`:

```nginx
server {
    server_name workofhuman.com www.workofhuman.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable SSL via Let's Encrypt:
```bash
sudo certbot --nginx -d workofhuman.com -d www.workofhuman.com
```

---

## 4. Production PostgreSQL Best Practices

### Connection Pool Configuration
In high-concurrency environments, avoid unbounded connections. The connection pool in `src/lib/db/index.ts` is configured with:
- `max: 10` connections per node process.
- `idleTimeoutMillis: 30000` (reclaims idle connections after 30s).
- `connectionTimeoutMillis: 6000` (fails fast on network partitions).

### Database Health Check Query
To verify database responsiveness at any time, execute the built-in checker:
```typescript
import { checkDatabaseConnection } from "@/lib/db";

const status = await checkDatabaseConnection();
// Returns: { ok: true, database: 'workofhuman' }
```

---

## 5. Ongoing Maintenance & Upgrades

### Pulling Updates:
```bash
cd /var/www/workofhuman
git pull origin main
npm install
npm run build
pm2 restart workofhuman
```

### Database Backups (pg_dump):
```bash
# Automated daily backup
pg_dump -U postgres -d workofhuman -n workofhuman | gzip > /backups/workofhuman_$(date +%Y%m%d).sql.gz
```
