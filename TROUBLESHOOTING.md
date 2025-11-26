# 🦅 TROUBLESHOOTING - Platform Bomboş Sorunu

## **DURUM:** API çalışıyor ama platform bomboş görünüyor

---

## **TEST SONUÇLARI:**

### **✅ API (Çalışıyor):**
- Products endpoint: 2 ürün geliyor
- Response: JSON formatında
- CORS: Headers var
- Database: 2 products
- Uptime: 7m stable

### **✅ Frontend (Çalışıyor):**
- Accounts: 77s uptime
- Admin: 7m uptime
- Pages: Yükleniyor
- "Product Catalog" görünüyor

### **⚠️ Sorun:**
- Products loading state'inde kalıyor
- Ürünler görünmüyor
- API call yapılıyor ama data render edilmiyor

---

## **MUHTEMEL NEDENLER:**

### **1. CORS (En olası):**
```
Frontend → API call yapıyor
Browser CORS policy bloke ediyor
Data gelmiyor
Loading state devam ediyor
```

**Çözüm:** Browser console'da CORS error var mı kontrol et

### **2. API Response Format:**
```
API: JSON dönüyor ✅
Frontend: JSON parse ediyor ✅
Ama state set edilmiyor ❌
```

**Çözüm:** Try/catch içinde hata logla

### **3. JavaScript Execution:**
```
SSR: HTML render oluyor ✅
CSR: JavaScript çalışmıyor? ❌
```

**Çözüm:** Browser console kontrol

---

## **ÇÖZÜM ADIMLARİ:**

### **Browser'da kontrol et:**
```
1. accounts.eagledtfsupply.com/products aç
2. F12 → Console tab
3. Hataları göreceksin:
   - CORS error? → Backend CORS fix
   - Network error? → API down
   - JavaScript error? → Build issue
```

### **CORS ise:**
```bash
# Backend main.ts CORS config kontrol
cd /var/www/eagle/backend
cat src/main.ts | grep -A15 enableCors

# origin: '*' olmalı
# credentials: false olmalı (origin * ile)
```

### **JavaScript error ise:**
```bash
# Rebuild with clean
cd /var/www/eagle/accounts
rm -rf .next
npm run build
pm2 restart eagle-accounts
```

---

## **HIZLI TEST:**

```bash
# 1. API test (terminal)
curl https://api.eagledtfsupply.com/api/v1/catalog/products

# 2. CORS test
curl -H "Origin: https://accounts.eagledtfsupply.com" \
     -I https://api.eagledtfsupply.com/api/v1/catalog/products

# 3. Browser test (zorunlu)
# F12 → Network tab → products call'unu gör
```

---

## **SİSTEM SAĞLIK:**

- PM2: ✅ All online
- API: ✅ 7m stable
- Database: ✅ 2 products
- Build: ✅ Success

**Sorun frontend'te - Browser console gerekli!**

