---
description: Deploy Eagle B2B Engine to production server (DigitalOcean)
---

# 🦅 Eagle Engine Deployment & Infrastructure Full Report

This workflow follows the strict deployment rules for the **DigitalOcean** environment.

## ⛔ 1. KESİN YASAKLAR (STRICT PROHIBITIONS)

**Aşağıdaki kuralların ihlali sunucunun çökmesine ve diğer ticari uygulamaların durmasına neden olur:**

1.  **KAYNAK SINIRLARINI KALDIRMA:** `docker-compose.yml` içindeki `deploy.resources.limits` ayarlarını (CPU ve RAM kısıtları) kesinlikle kaldırma veya yükseltme. Tüm Eagle projesi toplamda **%10 CPU ve %20 RAM** sınırına tabidir.
2.  **DİĞER UYGULAMALARA DOKUNMA:** `/opt/apps/custom/customizerapp/` ve `/opt/apps/custom/ssactivewear/` dizinlerine ve bu dizinlerdeki container'lara (CustomizerApp, SSActiveWear) kesinlikle müdahale etme.
3.  **LOKAL DB KULLANMA:** Sunucu üzerindeki yerel Docker PostgreSQL container'larını (`factoryengine-eagledtf-db`) sakın kullanma. Prod datası **Managed DB** üzerindedir.
4.  **HOST ÜZERİNDE PM2 ÇALIŞTIRMA:** Sunucunun kendisinde (host seviyesinde) PM2 süreci başlatma. Tüm servisler Docker container'ı içinde izole çalışmalıdır.
5.  **CADDY GLOBAL AYARLAR:** `/opt/apps/caddy/Caddyfile` içindeki global ayarları (TLS, ACME, admin, log) değiştirme. Sadece yeni subdomain gerekirse Eagle bloklarına ekleme yap.
6.  **CADDY DİĞER BLOKLAR:** Caddy'deki diğer uygulamalara ait domain bloklarını (CustomizerApp, SSActiveWear vb.) düzenleme veya silme.
7.  **CADDY RELOAD:** Caddyfile değişikliğinden sonra önce `caddy validate` ile doğrula, sonra `caddy reload` yap.
8.  **CONTAINER İSİMLERİ:** Docker container isimlerini değiştirme — Caddy reverse proxy bu isimlere bağımlıdır.
9.  **DOCKER NETWORK:** `appnet` dış ağını silme veya yeniden oluşturma.
10. **PROJELER ARASI İŞLEM:** `eagledtfsupply` ve `eagledtfprint` arasında açık ve yazılı Türkçe izin almadan dosya kopyalama/taşıma/silme yapma.

## 🔑 2. BAĞLANTI VE ERİŞİM BİLGİLERİ

### Sunucu Erişimi (SSH)
- **Host IP:** `104.236.78.45` | **User:** `root` | **Port:** `22`
- **SSH Key:** `~/.ssh/appserver` (Local makinede)

### Managed PostgreSQL (DigitalOcean)
- **Host:** `private-db-postgresql-nyc3-64923-do-user-33221790-0.f.db.ondigitalocean.com`
- **Port:** `25060` | **User:** `doadmin` | **Database:** `eagle_db`
- **Password:** `[HIDDEN_IN_ENV]`
- **SSL Mode:** `require` (Prisma'da `sslmode=no-verify` eklenmiştir).

## 📂 3. PROJE VE GİT KONFİGÜRASYONU

- **Dizin:** `/opt/apps/custom/factoryengine/eagledtfsupply/`
- **Git Repo:** `https://github.com/jesuisfatih/eagle-engine.dev`
- **Branch:** `master`

### Servisler & Portlar
- `app.eagledtfsupply.com` (Port 3000)
- `accounts.eagledtfsupply.com` (Port 3001)
- `api.eagledtfsupply.com` (Port 4000)
- `campaigns.eagledtfsupply.com` (Port 3010)

## 🛠️ 4. DEPLOYMENT STEPS

// turbo-all

1. Push local changes to GitHub:
```bash
cd c:\Users\mhmmd\Desktop\eagle-engine.dev
git add -A && git commit -m "deploy: digitalocean migration" && git push origin master
```

2. SSH into server and update Docker:
```bash
ssh -i ~/.ssh/appserver root@104.236.78.45 "cd /opt/apps/custom/factoryengine/eagledtfsupply/ && git pull origin master && docker compose build && docker compose up -d"
```

3. Rebuild Admin/Backend inside container (if needed):
```bash
ssh -i ~/.ssh/appserver root@104.236.78.45 "docker exec factoryengine-eagledtf-app bash -c 'cd /app/backend && npx prisma db push && npm run build && pm2 restart all'"
```

## 📊 5. FAYDALI KOMUTLAR
- **Status:** `ssh -i ~/.ssh/appserver root@104.236.78.45 "docker exec factoryengine-eagledtf-app pm2 status"`
- **Logs:** `docker logs -f factoryengine-eagledtf-app`
- **Caddy Reload:** `ssh -i ~/.ssh/appserver root@104.236.78.45 "docker exec caddy caddy reload"`
- **Container Stats:** `docker stats`
