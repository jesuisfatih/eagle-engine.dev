# 🦅 EAGLE B2B ENGINE - UÇTAN UCA KONTROL LİSTESİ

**Tarih:** 10 Aralık 2025  
**Amaç:** Tüm kritik iş akışlarının çalışıp çalışmadığını doğrulamak

---

## 🆕 EKSİK BULUNAN VE TAMAMLANAN MODÜLLER

### ✅ Bu Oturumda Eklenen Backend Modülleri:

| Modül | Endpoint | Durum |
|-------|----------|-------|
| **Support Tickets** | `/api/v1/support-tickets` | ✅ Oluşturuldu |
| **Wishlist** | `/api/v1/users/:id/wishlist` | ✅ Oluşturuldu |
| **Addresses** | `/api/v1/addresses` | ✅ Oluşturuldu |
| **Notifications (markAsRead)** | `/api/v1/notifications/:id/read` | ✅ Eklendi |
| **Company Users (me)** | `/api/v1/company-users/me` | ✅ Eklendi |

### ✅ Frontend API Düzeltmeleri:

| Sayfa | Düzeltme | Durum |
|-------|----------|-------|
| `accounts/addresses` | `/api/v1/addresses` endpoint'leri düzeltildi | ✅ |
| `accounts/notifications` | PUT method + endpoint isimleri | ✅ |
| `accounts/quotes` | React Modal + accountsFetch | ✅ |
| `accounts/team` | accountsFetch kullanımı | ✅ |
| `accounts/cart` | accountsFetch - updateQuantity, removeItem, createCart | ✅ |
| `accounts/products` | accountsFetch kullanımı | ✅ |
| `accounts/dashboard` | accountsFetch kullanımı | ✅ |
| `accounts/profile` | accountsFetch kullanımı | ✅ |
| `accounts/orders` | accountsFetch kullanımı | ✅ |
| `accounts/orders/[id]` | accountsFetch kullanımı | ✅ |
| `accounts/products/[id]` | accountsFetch kullanımı | ✅ |
| `accounts/login` | publicFetch kullanımı | ✅ |
| `accounts/register` | publicFetch kullanımı | ✅ |
| `accounts/register/[token]` | publicFetch kullanımı | ✅ |
| `components/Header` | accountsFetch kullanımı | ✅ |

### 📌 API Client Güncellemeleri:

| Fonksiyon | Kullanım | Durum |
|-----------|----------|-------|
| `accountsFetch()` | Authenticated endpoints | ✅ |
| `publicFetch()` | Public endpoints (login, register) | ✅ |
| `getApiUrl()` | Get API URL for external use | ✅ |

### 📊 Events Sistemi Analizi:

| Bileşen | Durum | Notlar |
|---------|-------|--------|
| `POST /api/v1/events/collect` | ✅ Çalışıyor | Public endpoint |
| `EventsProcessorWorker` | ✅ Çalışıyor | BullMQ async processing |
| Snippet `page_view` | ✅ Çalışıyor | Tüm sayfalarda |
| Snippet `product_view` | ✅ Çalışıyor | Ürün sayfalarında |
| Snippet `add_to_cart` | ✅ Çalışıyor | Click listener |
| Snippet `cart_sync` | ✅ Çalışıyor | abandoned-carts/track |

---

## 📋 KONTROL SENARYOLARI

### 🔴 SEVİYE 1: KRİTİK (Sistem Çalışmaz!)

---

### 1️⃣ MÜŞTERİ KAYIT → SHOPIFY SYNC
**Akış:** Yeni müşteri kaydı → Eagle DB → Shopify'a customer oluşturma

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 1.1 | Accounts'ta register ol | User + Company oluşturulmalı | `/register` veya `/request-invitation` | ⏳ |
| 1.2 | Email verification | Doğrulama kodu çalışmalı | Email alınıyor mu? | ⏳ |
| 1.3 | DB kontrolü | `company_users` ve `companies` tablolarında kayıt olmalı | DB Query | ⏳ |
| 1.4 | Shopify'a sync | Shopify Admin → Customers'da görünmeli | Shopify Admin | ⏳ |
| 1.5 | Login test | Kayıt olan kullanıcı giriş yapabilmeli | `/login` | ⏳ |

**Backend API'ler:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-email-code`
- Shopify REST API → `POST /customers.json`

---

### 2️⃣ SHOPIFY → EAGLE SYNC (20 Saniye)
**Akış:** Shopify'da customer/product değişikliği → Eagle'a otomatik sync

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 2.1 | Scheduler çalışıyor mu? | PM2 logs'ta 20 saniyede bir sync | `pm2 logs eagle-api` | ⏳ |
| 2.2 | Yeni Shopify customer | Eagle DB'de `shopify_customers`'a eklenmeli | DB Query | ⏳ |
| 2.3 | Yeni Shopify product | Eagle DB'de `catalog_products`'a eklenmeli | DB Query | ⏳ |
| 2.4 | Admin'de görünme | Customers ve Products sayfalarında görünmeli | Admin Panel | ⏳ |

**Backend API'ler:**
- `SyncScheduler` (20 saniye cron)
- BullMQ Workers: `customers-sync.worker`, `products-sync.worker`

---

### 3️⃣ SHOPIFY CUSTOMER → B2B FİRMA DÖNÜŞTÜRME
**Akış:** Admin panelde Shopify customer → B2B Company oluşturma → Davet emaili

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 3.1 | Admin'de Shopify müşteri listesi | Shopify customers görünmeli | `/companies` tab | ⏳ |
| 3.2 | "Convert to B2B" butonu | Company oluşturulmalı | Admin Panel | ⏳ |
| 3.3 | DB kontrolü | `companies` tablosunda yeni kayıt | DB Query | ⏳ |
| 3.4 | Davet emaili | Müşteriye invitation emaili gitmeli | Email | ⏳ |
| 3.5 | Davet kabul | `/accept-invitation?token=xxx` çalışmalı | Accounts | ⏳ |

**Backend API'ler:**
- `POST /api/v1/shopify-customers/:id/convert-to-company`
- `MailService.sendInvitationEmail()`
- `POST /api/v1/auth/accept-invitation`

---

### 4️⃣ DISCOUNT / PRİCİNG SİSTEMİ
**Akış:** Admin pricing rule oluştur → Müşteri ürün fiyatını görsün → Checkout'ta indirim uygulansın

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 4.1 | Pricing rule oluştur | Rule kaydedilmeli | Admin `/pricing` | ⏳ |
| 4.2 | Rule tipleri test | %, fixed, qty breaks çalışmalı | Admin Panel | ⏳ |
| 4.3 | Shopify'da discount kodu | Price rule Shopify Admin'de görünmeli | Shopify Admin → Discounts | ⏳ |
| 4.4 | Müşteri fiyat görsün | Products sayfasında B2B fiyat görünmeli | Accounts `/products` | ⏳ |
| 4.5 | Cart'ta indirim | Sepet toplamında indirim uygulanmalı | Accounts `/cart` | ⏳ |
| 4.6 | Checkout'ta discount | Shopify checkout'ta discount kodu çalışmalı | Shopify Checkout | ⏳ |

**Backend API'ler:**
- `POST /api/v1/pricing/rules`
- `POST /api/v1/pricing/calculate`
- `ShopifyAdminDiscountService.createDiscount()`
- `DiscountEngineService.generateDiscountCode()`

---

### 5️⃣ SEPET ONAY SİSTEMİ (Cart Approval)
**Akış:** Buyer sepet oluştur → Onay için gönder → Approver onayla → Checkout

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 5.1 | Sepet oluştur | Draft cart oluşmalı | Accounts `/cart` | ⏳ |
| 5.2 | Ürün ekle | CartItem eklenmeli | Accounts `/cart` | ⏳ |
| 5.3 | Onay için gönder | Status: pending_approval | Accounts `/cart` | ⏳ |
| 5.4 | Approver görsün | Pending carts listesi | Admin veya Accounts | ⏳ |
| 5.5 | Onayla | Status: approved | Admin/Accounts | ⏳ |
| 5.6 | Checkout | Shopify checkout'a yönlendir | Accounts | ⏳ |

**Backend API'ler:**
- `POST /api/v1/carts`
- `POST /api/v1/carts/:id/items`
- `POST /api/v1/carts/:id/submit`
- `POST /api/v1/carts/:id/approve`
- `POST /api/v1/checkout/create`

---

### 6️⃣ CHECKOUT → SHOPIFY ENTEGRASYONU
**Akış:** Eagle cart → Shopify checkout → Ödeme → Order webhook → Eagle order

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 6.1 | Checkout butonuna tıkla | Shopify checkout URL oluşmalı | Accounts `/cart` | ⏳ |
| 6.2 | Discount kodu uygulanmalı | Checkout'ta indirim görünmeli | Shopify Checkout | ⏳ |
| 6.3 | Ödeme yap | Test ödeme yapılabilmeli | Shopify Checkout | ⏳ |
| 6.4 | Webhook tetiklenmeli | orders/paid webhook gelmeli | Backend logs | ⏳ |
| 6.5 | Eagle'da order | `orders_local` tablosunda kayıt | DB Query | ⏳ |
| 6.6 | Orders sayfasında görünme | Admin ve Accounts'ta order görünmeli | Frontend | ⏳ |

**Backend API'ler:**
- `POST /api/v1/checkout/create`
- `ShopifyStorefrontService.createCart()`
- `POST /webhooks/orders/paid` (Shopify → Eagle)
- `OrdersHandler.handleOrderPaid()`

---

### 7️⃣ SSO (Single Sign-On) SİSTEMİ
**Akış:** Eagle login → Shopify'a otomatik giriş (Multipass veya Alternative)

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 7.1 | Eagle'a login | JWT token alınmalı | Accounts `/login` | ⏳ |
| 7.2 | SSO mode kontrolü | Settings'te mode seçili olmalı | Admin `/settings` | ⏳ |
| 7.3 | Shopify redirect | Checkout'ta Shopify'a login olmadan giriş | Shopify Store | ⏳ |
| 7.4 | Customer eşleşme | Doğru müşteri olarak giriş yapılmalı | Shopify Account | ⏳ |

**Backend API'ler:**
- `POST /api/v1/auth/shopify-sso` (Multipass)
- `ShopifySsoService.generateMultipassUrl()`
- Alternative SSO: Snippet + Cookie

---

### 8️⃣ WEBHOOK GÜVENLİĞİ
**Akış:** Shopify webhook → Signature doğrulama → İşleme

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 8.1 | Gerçek webhook | HMAC doğrulanmalı | Backend | ⏳ |
| 8.2 | Sahte webhook | 401 dönmeli | Postman/curl | ⏳ |
| 8.3 | Idempotency | Aynı webhook 2x işlenmemeli | Backend | ⏳ |

**Backend:**
- `WebhookAuthGuard`
- HMAC-SHA256 verification

---

## 🟡 SEVİYE 2: ÖNEMLİ (Özellikler Eksik Kalır)

---

### 9️⃣ TEAM MANAGEMENT (Şirket Kullanıcıları)
**Akış:** Admin/Company owner → Yeni kullanıcı davet → Rol ata

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 9.1 | Team member davet et | Invitation emaili gitmeli | Accounts `/team` | ⏳ |
| 9.2 | Rol seçimi | buyer, approver, admin seçilebilmeli | Accounts | ⏳ |
| 9.3 | Davet kabul | Yeni kullanıcı giriş yapabilmeli | Email → Accounts | ⏳ |
| 9.4 | Yetki kontrolü | Buyer sadece sepet oluşturabilmeli | Accounts | ⏳ |

**Backend API'ler:**
- `POST /api/v1/companies/:id/users`
- `PUT /api/v1/companies/:id/users/:userId`

---

### 🔟 EVENT TRACKING & ANALYTICS
**Akış:** Snippet event → Backend → Analytics dashboard

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 10.1 | Snippet yükleniyor mu? | Console'da hata yok | Shopify Store | ⏳ |
| 10.2 | page_view event | Event API'ye ulaşıyor | Network tab | ⏳ |
| 10.3 | product_view event | Ürün görüntüleme kaydediliyor | DB | ⏳ |
| 10.4 | add_to_cart event | Sepete ekleme kaydediliyor | DB | ⏳ |
| 10.5 | Analytics dashboard | Events görünüyor | Admin `/analytics` | ⏳ |
| 10.6 | Funnel analizi | Conversion oranları hesaplanıyor | Admin | ⏳ |

**Backend API'ler:**
- `POST /api/v1/events/collect`
- `EventsProcessorWorker`
- `GET /api/v1/events/analytics`

---

### 1️⃣1️⃣ ABANDONED CARTS (Terk Edilen Sepetler)
**Akış:** Sepet oluştur → Checkout'a gitmeden çık → Admin'de görünsün → Hatırlatma

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 11.1 | Sepet oluştur, çık | Cart kaydedilmeli | Accounts | ⏳ |
| 11.2 | Admin'de görünme | Abandoned carts listesi | Admin `/abandoned-carts` | ⏳ |
| 11.3 | Hatırlatma gönder | Email gitmeli | Admin Panel | ⏳ |
| 11.4 | Müşteri görsün | Kendi abandoned carts'ı görmeli | Accounts | ⏳ |

**Backend API'ler:**
- `GET /api/v1/abandoned-carts`
- `POST /api/v1/abandoned-carts/:id/remind`

---

### 1️⃣2️⃣ QUOTE/TEKLİF SİSTEMİ
**Akış:** Müşteri teklif iste → Admin teklifi onayla → Sipariş

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 12.1 | Quote oluştur | Quote kaydedilmeli | Accounts `/quotes` | ⏳ |
| 12.2 | Admin görsün | Pending quotes listesi | Admin `/quotes` | ⏳ |
| 12.3 | Admin onayla | Quote approved status | Admin | ⏳ |
| 12.4 | Müşteri checkout | Approved quote checkout | Accounts | ⏳ |

**Backend API'ler:**
- `POST /api/v1/quotes`
- `POST /api/v1/quotes/:id/approve`

---

### 1️⃣3️⃣ SUPPORT TİCKET SİSTEMİ
**Akış:** Müşteri ticket oluştur → Admin yanıtla → Çözüm

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 13.1 | Ticket oluştur | Ticket kaydedilmeli | Accounts `/support` | ⏳ |
| 13.2 | Admin görsün | Tickets listesi | Admin `/support` | ⏳ |
| 13.3 | Status değiştir | Status güncellenebilmeli | Admin | ⏳ |

---

### 1️⃣4️⃣ NOTIFICATION SİSTEMİ
**Akış:** Sistem event → Notification oluştur → Kullanıcı görsün

| # | Test Adımı | Beklenen Sonuç | Test Yeri | Durum |
|---|------------|----------------|-----------|-------|
| 14.1 | Order oluşunca | Notification gelmeli | Accounts | ⏳ |
| 14.2 | Notification listesi | Okunmamışlar görünmeli | Accounts `/notifications` | ⏳ |
| 14.3 | Okundu işaretle | Status değişmeli | Accounts | ⏳ |

---

## 🟢 SEVİYE 3: İYİLEŞTİRME

---

### 1️⃣5️⃣ FRONTEND UX
| # | Test Adımı | Beklenen Sonuç | Durum |
|---|------------|----------------|-------|
| 15.1 | Loading states | Spinner görünmeli | ⏳ |
| 15.2 | Error handling | Toast/Modal hata mesajı | ⏳ |
| 15.3 | Empty states | Boş veri mesajı | ⏳ |
| 15.4 | Mobile responsive | Mobilde düzgün görünmeli | ⏳ |

---

### 1️⃣6️⃣ ADMIN PANEL
| # | Test Adımı | Beklenen Sonuç | Durum |
|---|------------|----------------|-------|
| 16.1 | Dashboard stats | Gerçek veriler görünmeli | ⏳ |
| 16.2 | Search/Filter | Arama çalışmalı | ⏳ |
| 16.3 | Pagination | Sayfalama çalışmalı | ⏳ |
| 16.4 | Export CSV | Dışa aktarma çalışmalı | ⏳ |

---

## 📊 TEST ÖZET TABLOSU

| Kategori | Toplam Test | Kritik | Önemli | İyileştirme |
|----------|-------------|--------|--------|-------------|
| Auth & SSO | 9 | ✅ | | |
| Sync | 4 | ✅ | | |
| Company Mgmt | 5 | ✅ | | |
| Pricing/Discount | 6 | ✅ | | |
| Cart/Checkout | 12 | ✅ | | |
| Webhooks | 3 | ✅ | | |
| Team Mgmt | 4 | | ✅ | |
| Analytics | 6 | | ✅ | |
| Abandoned Carts | 4 | | ✅ | |
| Quotes | 4 | | ✅ | |
| Support | 3 | | ✅ | |
| Notifications | 3 | | ✅ | |
| UX | 4 | | | ✅ |
| Admin | 4 | | | ✅ |
| **TOPLAM** | **71** | **39** | **24** | **8** |

---

## 🚀 TEST KOMUTLARI

### Backend API Test
```bash
# Health check
curl https://api.eagledtfsupply.com/health

# Auth test
curl -X POST https://api.eagledtfsupply.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Products test  
curl https://api.eagledtfsupply.com/api/v1/catalog/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Pricing calculate test
curl -X POST https://api.eagledtfsupply.com/api/v1/pricing/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"companyId":"xxx","items":[{"variantId":"yyy","quantity":1}]}'
```

### Database Check
```bash
# SSH to server
ssh root@5.78.148.183

# Check companies
psql -U eagle_user -d eagle_db -c "SELECT COUNT(*) FROM companies;"

# Check sync logs
psql -U eagle_user -d eagle_db -c "SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10;"

# Check orders
psql -U eagle_user -d eagle_db -c "SELECT COUNT(*) FROM orders_local;"
```

### PM2 & Logs
```bash
# Status
pm2 status

# Backend logs
pm2 logs eagle-api --lines 100

# Check scheduler
pm2 logs eagle-api | grep "sync"
```

---

## ✅ TEST TAMAMLANMA DURUMU

**Son Güncelleme:** ___________

| Senaryo | Durum | Notlar |
|---------|-------|--------|
| 1. Müşteri Kayıt | ⏳ | |
| 2. Sync | ⏳ | |
| 3. B2B Dönüştürme | ⏳ | |
| 4. Pricing/Discount | ⏳ | |
| 5. Cart Approval | ⏳ | |
| 6. Checkout | ⏳ | |
| 7. SSO | ⏳ | |
| 8. Webhooks | ⏳ | |
| 9. Team Mgmt | ⏳ | |
| 10. Analytics | ⏳ | |
| 11. Abandoned Carts | ⏳ | |
| 12. Quotes | ⏳ | |
| 13. Support | ⏳ | |
| 14. Notifications | ⏳ | |

**Tamamlanma Oranı:** 0/14 (0%)

---

## 🎯 ÖNCELİK SIRASI

1. 🔴 **Müşteri Kayıt + Shopify Sync** → Temel akış
2. 🔴 **Pricing/Discount** → Gelir kritik
3. 🔴 **Checkout Entegrasyonu** → Satış kritik
4. 🔴 **Webhook Güvenliği** → Veri bütünlüğü
5. 🟡 **SSO** → Kullanıcı deneyimi
6. 🟡 **Team Management** → B2B özellik
7. 🟡 **Analytics** → Raporlama
8. 🟢 **Diğerleri** → Nice-to-have
