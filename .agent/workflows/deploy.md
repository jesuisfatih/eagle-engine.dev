---
description: Deploy Eagle B2B Engine to production server (Hetzner)
---

# Eagle B2B Engine - Production Deployment

## Server & Connection Info

| Key | Value |
|-----|-------|
| **IP** | `5.78.148.183` (Hetzner) |
| **SSH Key** | `~/.ssh/hetzner_gsb` |
| **SSH Command** | `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183` |
| **Project Root** | `/var/www/eagle/` |

## GitHub Repository

| Key | Value |
|-----|-------|
| **Repo** | `jesuisfatih/eagle-engine.dev` |
| **URL** | `https://github.com/jesuisfatih/eagle-engine.dev` |
| **Branch** | `main` |

## Server Directories

| Service | Directory |
|---------|-----------|
| Project Root | `/var/www/eagle/` |
| Admin Panel | `/var/www/eagle/admin` |
| Accounts Panel | `/var/www/eagle/accounts` |
| Backend API | `/var/www/eagle/backend` |
| Snippet | `/var/www/eagle/snippet` |
| Deploy Scripts | `/var/www/eagle/deploy` |

## PM2 Services

| ID | Name | Port | Mode |
|----|------|------|------|
| 0-1 | eagle-api | 4000 | cluster x2 |
| 2 | eagle-admin | 3000 | fork |
| 3 | eagle-accounts | 3001 | fork |

## Domains & URLs

| Service | URL |
|---------|-----|
| Admin Panel | `https://app.eagledtfsupply.com` |
| Accounts Panel | `https://accounts.eagledtfsupply.com` |
| API | `https://api.eagledtfsupply.com` |
| CDN | `https://cdn.eagledtfsupply.com` |
| API Health | `https://api.eagledtfsupply.com/api/v1/health` |

## Database & Redis

| Service | Info |
|---------|------|
| PostgreSQL | `eagle_user:Eagle2025!Secure@localhost:5432/eagle_db` |
| Redis | `localhost:6379` (default) |

## Reverse Proxy

- **Caddy** — Protected: `chattr +i /usr/bin/caddy` + `apt-mark hold caddy`

## Login Credentials

| Panel | User | Password |
|-------|------|----------|
| Admin Panel | `admin` | `eagle2025` |
| B2B Admin | `admin@testb2b.com` | `test1234` |
| B2B Buyer | `buyer@testb2b.com` | `test1234` |

---

## Deployment Steps

### Option A: Quick Deploy (Code changes only, no DB reset)

// turbo-all

1. Push local changes to GitHub:
```bash
cd c:\Users\mhmmd\Desktop\eagle-engine.dev
git add -A && git commit -m "deploy: update" && git push origin main
```

2. SSH into server and pull + rebuild:
```bash
ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "cd /var/www/eagle && git pull origin main && cd backend && npm install && npx prisma generate && npx prisma db push && npm run build && cd ../admin && npm install && NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com npm run build && cd ../accounts && npm install && NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com npm run build && cd ../snippet && npm install && npm run build && cp -r dist/* /var/www/eagle/cdn/ && cd /var/www/eagle && pm2 restart all && pm2 save"
```

3. Verify deployment:
```bash
curl -s https://api.eagledtfsupply.com/api/v1/health | head -c 200
```

### Option B: Full Deploy (with DB reset)

1. Push local changes to GitHub (same as Option A step 1)

2. SSH into server and run full deploy:
```bash
ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "cd /var/www/eagle && git pull origin main && bash deploy/final-deploy.sh"
```

### Option C: Backend-Only Deploy

1. Push and deploy only backend:
```bash
ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "cd /var/www/eagle && git pull origin main && cd backend && npm install && npx prisma generate && npx prisma db push && npm run build && pm2 restart eagle-api && pm2 save"
```

### Option D: Admin-Only Deploy

1. Push and deploy only admin panel:
```bash
ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "cd /var/www/eagle && git pull origin main && cd admin && npm install && NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com npm run build && pm2 restart eagle-admin && pm2 save"
```

### Useful Commands

- **Check PM2 status:** `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "pm2 list"`
- **Check PM2 logs:** `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "pm2 logs --lines 50"`
- **Restart all:** `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "pm2 restart all"`
- **Check disk:** `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "df -h"`
- **Check Caddy:** `ssh -i ~/.ssh/hetzner_gsb root@5.78.148.183 "systemctl status caddy"`
