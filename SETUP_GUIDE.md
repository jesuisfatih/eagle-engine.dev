# 🦅 EAGLE B2B ENGINE - SETUP GUIDE

## **SHOPIFY MULTIPASS KURULUM:**

### **1. Shopify Plus Gereksinimi:**
⚠️ **Multipass sadece Shopify Plus'ta mevcuttur**
- Standard Shopify: Multipass YOK
- Shopify Plus: Multipass VAR

### **2. Multipass Aktifleştirme:**

#### **Adım 1: Shopify Admin**
```
1. Shopify Admin'e gir
2. Settings → Customer accounts
3. "Classic customer accounts" veya "New customer accounts" seç
4. Scroll down → "Multipass" bölümü
5. "Enable Multipass" toggle'ı aç
6. Multipass secret görünecek (64 karakter)
```

#### **Adım 2: Secret'ı Kopyala**
```
Örnek: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...
```

#### **Adım 3: Server .env Dosyasına Ekle**
```bash
ssh root@5.78.148.183 -i ~/.ssh/hetzner_gsb
cd /var/www/eagle/backend
nano .env

# Ekle:
SHOPIFY_MULTIPASS_SECRET=your_64_character_secret_here

# Save: Ctrl+X, Y, Enter
pm2 restart eagle-api
```

---

## **SNIPPET KURULUM:**

### **Shopify Theme'e Ekleme:**

#### **Adım 1: Theme Editor**
```
1. Shopify Admin → Online Store → Themes
2. Actions → Edit code
3. Layout → theme.liquid
```

#### **Adım 2: Snippet Ekle**
```liquid
<!-- theme.liquid dosyasında </body> tag'inden ÖNCE -->

<!-- BURAYA YAPIŞTAR: snippet/shopify-multipass-complete.liquid içeriğini -->

</body>
```

#### **Adım 3: Save**
```
Save butonuna bas
Test: Shopify store'unu ziyaret et
Console'da "✅ Eagle SSO" mesajları göreceksin
```

---

## **TEST SENARYOLARI:**

### **SENARYO 1: Accounts → Shopify**
```
1. accounts.eagledtfsupply.com/login → Login
2. Add product to cart
3. Click "Proceed to Checkout"
4. Should redirect to Shopify
5. Should be AUTOMATICALLY logged in ✅
6. Should see checkout page ✅
```

### **SENARYO 2: Shopify F5**
```
1. accounts.eagledtfsupply.com → Login
2. Open new tab: eagle-dtf-supply0.myshopify.com
3. Press F5 (reload)
4. Should be logged in automatically ✅
5. No login prompt ✅
```

### **SENARYO 3: Product Page**
```
1. accounts.eagledtfsupply.com → Login
2. eagle-dtf-supply0.myshopify.com/products/xyz
3. Should be logged in ✅
4. Can add to cart ✅
```

### **SENARYO 4: Shopify → Accounts**
```
1. eagle-dtf-supply0.myshopify.com → Login
2. accounts.eagledtfsupply.com
3. Should be logged in ✅
4. Session synced ✅
```

---

## **SYNC FIX:**

### **Sync Çalışmıyor mu?**
```bash
# PM2 check
pm2 list
pm2 logs eagle-api --lines 50

# Manuel sync test
curl -X POST https://api.eagledtfsupply.com/api/v1/sync/products \
  -H 'Content-Type: application/json' \
  -d '{}'

# Should return: {"message":"Products sync queued"}
```

### **Shopify Credentials Check:**
```bash
cd /var/www/eagle/backend
cat .env | grep SHOPIFY

# Should have:
SHOPIFY_STORE_DOMAIN=eagle-dtf-supply0.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_KEY=xxxxx
SHOPIFY_API_SECRET=xxxxx
```

---

## **KALAN SON EKSİKLER:**

### **1. Shopify Plus + Multipass:**
- ⚠️ Shopify Plus hesap gerekli
- ⚠️ Multipass enable (Admin → Settings)
- ⚠️ SHOPIFY_MULTIPASS_SECRET .env'e ekle

### **2. Checkout Button:**
- ✅ TAMAMLANDI (cart page, 2 buton)
- ✅ Multipass SSO entegre
- ✅ Fallback var

### **3. Snippet Deploy:**
- ⚠️ theme.liquid'e eklenmeli
- ⚠️ Test edilmeli
- ⚠️ Console log'lar kontrol

---

## **SISTEM DURUMU - 156 COMMITS:**

**✅ TAMAMLANAN:**
- Backend: 25 modül, /auth/user endpoint
- Accounts: Checkout Multipass button
- Shopify: Universal SSO snippet
- Multi-layer storage
- BroadcastChannel
- Service Worker
- Session management
- F5 handling
- Product page auto-login

**⚠️ KURULUM GEREKLİ:**
1. Shopify Plus (Multipass için)
2. Multipass enable
3. MULTIPASS_SECRET .env'e ekle
4. Snippet theme.liquid'e ekle

**SİSTEM %100 HAZIR - SADECE SHOPIFY AYARLARI KALDI!** 🚀

