# 🚀 EAGLE B2B - SUNUCU KURULUM ADIMLARI

## ✅ ŞU ANA KADAR YAPILAN:
1. ✅ GitHub'a 16 commit - Kod tamam
2. ✅ Sunucuya kod çekildi
3. ✅ Node.js, PostgreSQL, Redis, Caddy kurulu
4. ✅ Database oluşturuldu (eagle_db)
5. ✅ User oluşturuldu (eagle_user)
6. ✅ .env dosyası Shopify credentials ile oluşturuldu
7. ✅ Backend dependencies kuruldu
8. ✅ Prisma generate yapıldı

## 🔄 KALAN MANUEL ADIMLAR:

### SSH ile bağlan:
```bash
ssh root@5.78.148.183 -i ~/.ssh/hetzner_gsb
```

### 1. Database Schema Oluştur:
```bash
cd /var/www/eagle/backend
npx prisma db push --accept-data-loss
```

### 2. Backend Build:
```bash
npm run build
```

### 3. Admin Panel Build:
```bash
cd /var/www/eagle/admin
npm install
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com
EOF
npm run build
```

### 4. Accounts Panel Build:
```bash
cd /var/www/eagle/accounts
npm install
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com
EOF
npm run build
```

### 5. Snippet Build:
```bash
cd /var/www/eagle/snippet
npm install
npm run build
mkdir -p /var/www/eagle/cdn
cp -r dist/* /var/www/eagle/cdn/
```

### 6. Caddy Ayarla:
```bash
cat > /etc/caddy/Caddyfile << 'EOF'
app.eagledtfsupply.com {
    reverse_proxy localhost:3000
    encode gzip
}

accounts.eagledtfsupply.com {
    reverse_proxy localhost:3001
    encode gzip
}

api.eagledtfsupply.com {
    reverse_proxy localhost:4000
    encode gzip
}

cdn.eagledtfsupply.com {
    root * /var/www/eagle/cdn
    file_server
    encode gzip
    header {
        Access-Control-Allow-Origin *
    }
}
EOF

systemctl reload caddy
```

### 7. PM2 Başlat:
```bash
cd /var/www/eagle
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Servisleri Kontrol:
```bash
pm2 status
curl http://localhost:4000/api/v1
```

## ✅ BAŞARILI KURULUM KONTROLÜ:

```bash
# API çalışıyor mu?
curl https://api.eagledtfsupply.com/api/v1

# Admin panel çalışıyor mu?
curl -I https://app.eagledtfsupply.com

# Accounts panel çalışıyor mu?
curl -I https://accounts.eagledtfsupply.com

# CDN çalışıyor mu?
curl -I https://cdn.eagledtfsupply.com/snippet.js
```

## 📊 SHOPIFY CREDENTIALS:
NOT: Credentials zaten sunucuda .env dosyasına eklendi.
- API Key: ✅ Configured
- API Secret: ✅ Configured  
- Access Token: ✅ Configured
- Storefront Token: ✅ Configured

## 🎯 SİSTEM ÇALIŞMAYA HAZIR!

Bu adımları manuel yapınca sistem tamamen çalışacak!

