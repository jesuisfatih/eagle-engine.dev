# 🦅 Eagle B2B Commerce Engine - Master İş Planı

## 📋 Proje Özeti

**Proje Adı:** Eagle B2B Commerce Engine  
**Versiyon:** 1.0.0  
**Başlangıç Tarihi:** 25 Kasım 2025  
**Platform:** Shopify B2B Eklentisi  
**Sunucu:** Hetzner Cloud (Ubuntu) - 5.78.148.183  

### Domain Yapısı
- **Admin Panel:** app.eagledtfsupply.com (Mağaza sahibi paneli)
- **Firma Paneli:** accounts.eagledtfsupply.com (B2B müşteri paneli)
- **Backend API:** api.eagledtfsupply.com
- **CDN:** cdn.eagledtfsupply.com

---

## 🎯 Proje Hedefi

Shopify mağazalarına kurumsal B2B satın alma deneyimi kazandıran, özel fiyatlandırma, firma hesap yönetimi, alt kullanıcı sistemi, sepet ve sipariş yönetimi sunan tam kapsamlı bir SaaS platformu geliştirmek.

---

## 🏗️ Teknoloji Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** NestJS (TypeScript)
- **API:** REST + GraphQL
- **Validation:** class-validator, class-transformer
- **Authentication:** JWT + OAuth2 (Shopify)

### Frontend
- **Admin Panel:** React + Next.js 14 (App Router) + TypeScript
- **Firma Paneli:** React + Next.js 14 (App Router) + TypeScript
- **UI Framework:** TailwindCSS + shadcn/ui
- **State Management:** Zustand / TanStack Query
- **Forms:** React Hook Form + Zod

### Snippet
- **Tech:** Vanilla TypeScript
- **Build:** Vite/Rollup
- **Deployment:** CDN üzerinden serve

### Database & Cache
- **Primary DB:** PostgreSQL 16
- **ORM:** Prisma
- **Cache:** Redis 7
- **Queue:** BullMQ (Redis üzerinde)
- **Search:** PostgreSQL Full-Text Search (optional: Meilisearch)

### Infrastructure
- **Proxy:** Caddy 2 (Auto SSL)
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions
- **Deployment:** SSH → Hetzner Ubuntu
- **Monitoring:** PM2 + Custom logging

---

## 📊 Database Schema & İlişkiler

### 🗂️ Entity Relationship Diagram (Metin Formatı)

```
┌─────────────────┐
│   Merchants     │  (Shopify mağaza sahipleri)
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────────────┐
│  ShopifyCustomers       │  (Shopify'dan sync edilen müşteriler)
└────────┬────────────────┘
         │ 1
         │
         │ N
┌────────▼────────────────┐
│      Companies          │  (B2B Firmalar)
└────────┬────────────────┘
         │ 1
         │
         │ N
┌────────▼────────────────┐         ┌──────────────────┐
│   CompanyUsers          │◄────────┤  PricingRules    │
└────────┬────────────────┘    N    └──────────────────┘
         │ 1                    (Firma bazlı fiyat kuralları)
         │
         │ N
┌────────▼────────────────┐
│       Carts             │  (Eagle sepetleri)
└────────┬────────────────┘
         │ 1
         │
         │ N
┌────────▼────────────────┐
│      CartItems          │
└─────────────────────────┘

┌──────────────────┐
│  CatalogProducts │  (Shopify ürün kopyası)
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐
│ CatalogVariants  │
└──────────────────┘

┌──────────────────┐
│   ActivityLog    │  (Event store)
└──────────────────┘

┌──────────────────┐
│   OrdersLocal    │  (Shopify sipariş kopyası)
└──────────────────┘

┌──────────────────┐
│  DiscountCodes   │  (Shopify discount mapping)
└──────────────────┘
```

---

## 🗄️ Detaylı Tablo Yapıları

### 1. **merchants**
```sql
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_domain VARCHAR(255) UNIQUE NOT NULL,
    shopify_shop_id BIGINT UNIQUE,
    access_token TEXT NOT NULL,
    scope TEXT,
    plan_name VARCHAR(100) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    snippet_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchants_shop_domain ON merchants(shop_domain);
CREATE INDEX idx_merchants_status ON merchants(status);
```

**İlişkiler:**
- 1 merchant → N companies
- 1 merchant → N shopify_customers
- 1 merchant → N catalog_products

---

### 2. **shopify_customers**
```sql
CREATE TABLE shopify_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    shopify_customer_id BIGINT NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    addresses JSONB,
    tags VARCHAR(500),
    note TEXT,
    total_spent DECIMAL(12,2),
    orders_count INTEGER DEFAULT 0,
    raw_data JSONB,
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(merchant_id, shopify_customer_id)
);

CREATE INDEX idx_shopify_customers_merchant ON shopify_customers(merchant_id);
CREATE INDEX idx_shopify_customers_email ON shopify_customers(email);
CREATE INDEX idx_shopify_customers_shopify_id ON shopify_customers(shopify_customer_id);
```

**İlişkiler:**
- N shopify_customers → 1 merchant
- 1 shopify_customer → 0..1 company (birleştirilebilir)

---

### 3. **companies**
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    billing_address JSONB,
    shipping_address JSONB,
    company_group VARCHAR(100), -- 'VIP', 'wholesale', 'retail'
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
    settings JSONB DEFAULT '{}',
    created_by_shopify_customer_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_merchant ON companies(merchant_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_group ON companies(company_group);
```

**İlişkiler:**
- N companies → 1 merchant
- 1 company → N company_users
- 1 company → N pricing_rules
- 1 company → N carts

---

### 4. **company_users**
```sql
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    shopify_customer_id BIGINT,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'buyer', -- admin, manager, buyer, viewer
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    invitation_token VARCHAR(255),
    invitation_sent_at TIMESTAMP,
    invitation_accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(email)
);

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_email ON company_users(email);
CREATE INDEX idx_company_users_shopify_id ON company_users(shopify_customer_id);
```

**İlişkiler:**
- N company_users → 1 company
- 1 company_user → N activity_log
- 1 company_user → N carts

---

### 5. **catalog_products**
```sql
CREATE TABLE catalog_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    shopify_product_id BIGINT NOT NULL,
    title VARCHAR(500),
    handle VARCHAR(255),
    description TEXT,
    vendor VARCHAR(255),
    product_type VARCHAR(255),
    tags VARCHAR(1000),
    status VARCHAR(50),
    images JSONB,
    collections JSONB,
    raw_data JSONB,
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(merchant_id, shopify_product_id)
);

CREATE INDEX idx_catalog_products_merchant ON catalog_products(merchant_id);
CREATE INDEX idx_catalog_products_shopify_id ON catalog_products(shopify_product_id);
CREATE INDEX idx_catalog_products_handle ON catalog_products(handle);
```

**İlişkiler:**
- N catalog_products → 1 merchant
- 1 catalog_product → N catalog_variants

---

### 6. **catalog_variants**
```sql
CREATE TABLE catalog_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    shopify_variant_id BIGINT NOT NULL,
    sku VARCHAR(255),
    title VARCHAR(255),
    price DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    inventory_quantity INTEGER,
    weight DECIMAL(10,2),
    weight_unit VARCHAR(10),
    option1 VARCHAR(255),
    option2 VARCHAR(255),
    option3 VARCHAR(255),
    raw_data JSONB,
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shopify_variant_id)
);

CREATE INDEX idx_catalog_variants_product ON catalog_variants(product_id);
CREATE INDEX idx_catalog_variants_shopify_id ON catalog_variants(shopify_variant_id);
CREATE INDEX idx_catalog_variants_sku ON catalog_variants(sku);
```

**İlişkiler:**
- N catalog_variants → 1 catalog_product

---

### 7. **pricing_rules**
```sql
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Target (Kime?)
    target_type VARCHAR(50) NOT NULL, -- 'company', 'company_group', 'all'
    target_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    target_company_group VARCHAR(100),
    
    -- Scope (Neye?)
    scope_type VARCHAR(50) NOT NULL, -- 'all', 'products', 'collections', 'tags', 'variants'
    scope_product_ids BIGINT[],
    scope_collection_ids BIGINT[],
    scope_tags VARCHAR(1000),
    scope_variant_ids BIGINT[],
    
    -- Discount Type
    discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'fixed_price', 'cart_total', 'qty_break'
    discount_value DECIMAL(12,2),
    discount_percentage DECIMAL(5,2),
    
    -- Quantity breaks (JSONB: [{min_qty: 10, discount: 5}, {min_qty: 50, discount: 10}])
    qty_breaks JSONB,
    
    -- Cart conditions
    min_cart_amount DECIMAL(12,2),
    
    -- Priority & Status
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_merchant ON pricing_rules(merchant_id);
CREATE INDEX idx_pricing_rules_target_company ON pricing_rules(target_company_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(valid_from, valid_until);
```

**İlişkiler:**
- N pricing_rules → 1 merchant
- N pricing_rules → 0..1 company (target olarak)

---

### 8. **carts**
```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES company_users(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending_approval, approved, rejected, converted, abandoned
    
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_total DECIMAL(12,2) DEFAULT 0,
    tax_total DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    
    applied_pricing_rules JSONB, -- hangi kurallar uygulandı
    
    shopify_cart_id VARCHAR(255),
    shopify_checkout_url TEXT,
    
    approved_by_user_id UUID REFERENCES company_users(id),
    approved_at TIMESTAMP,
    converted_to_order_id UUID,
    converted_at TIMESTAMP,
    
    notes TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carts_merchant ON carts(merchant_id);
CREATE INDEX idx_carts_company ON carts(company_id);
CREATE INDEX idx_carts_created_by ON carts(created_by_user_id);
CREATE INDEX idx_carts_status ON carts(status);
```

**İlişkiler:**
- N carts → 1 merchant
- N carts → 1 company
- N carts → 1 company_user (created_by)
- 1 cart → N cart_items

---

### 9. **cart_items**
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    
    product_id UUID REFERENCES catalog_products(id),
    variant_id UUID REFERENCES catalog_variants(id),
    shopify_product_id BIGINT,
    shopify_variant_id BIGINT,
    
    sku VARCHAR(255),
    title VARCHAR(500),
    variant_title VARCHAR(255),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    
    list_price DECIMAL(12,2) NOT NULL, -- Shopify standart fiyat
    unit_price DECIMAL(12,2) NOT NULL, -- Eagle hesaplı fiyat
    discount_amount DECIMAL(12,2) DEFAULT 0,
    line_total DECIMAL(12,2),
    
    applied_pricing_rule_id UUID REFERENCES pricing_rules(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);
```

**İlişkiler:**
- N cart_items → 1 cart
- N cart_items → 1 catalog_variant

---

### 10. **orders_local**
```sql
CREATE TABLE orders_local (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    company_user_id UUID REFERENCES company_users(id),
    cart_id UUID REFERENCES carts(id),
    
    shopify_order_id BIGINT NOT NULL,
    shopify_order_number VARCHAR(100),
    shopify_customer_id BIGINT,
    
    email VARCHAR(255),
    subtotal DECIMAL(12,2),
    total_discounts DECIMAL(12,2),
    total_tax DECIMAL(12,2),
    total_price DECIMAL(12,2),
    currency VARCHAR(10),
    
    financial_status VARCHAR(50),
    fulfillment_status VARCHAR(50),
    
    line_items JSONB,
    shipping_address JSONB,
    billing_address JSONB,
    
    discount_codes JSONB,
    
    raw_data JSONB,
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(merchant_id, shopify_order_id)
);

CREATE INDEX idx_orders_local_merchant ON orders_local(merchant_id);
CREATE INDEX idx_orders_local_company ON orders_local(company_id);
CREATE INDEX idx_orders_local_shopify_id ON orders_local(shopify_order_id);
CREATE INDEX idx_orders_local_shopify_customer ON orders_local(shopify_customer_id);
```

**İlişkiler:**
- N orders_local → 1 merchant
- N orders_local → 0..1 company
- N orders_local → 0..1 cart (converted)

---

### 11. **activity_log**
```sql
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    company_user_id UUID REFERENCES company_users(id),
    
    shopify_customer_id BIGINT,
    session_id VARCHAR(255),
    eagle_token VARCHAR(500),
    
    event_type VARCHAR(100) NOT NULL, -- product_view, add_to_cart, search, checkout_start, ...
    
    product_id UUID REFERENCES catalog_products(id),
    variant_id UUID REFERENCES catalog_variants(id),
    shopify_product_id BIGINT,
    shopify_variant_id BIGINT,
    
    payload JSONB,
    
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_merchant ON activity_log(merchant_id);
CREATE INDEX idx_activity_log_company ON activity_log(company_id);
CREATE INDEX idx_activity_log_user ON activity_log(company_user_id);
CREATE INDEX idx_activity_log_event_type ON activity_log(event_type);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_log_session ON activity_log(session_id);
```

**İlişkiler:**
- N activity_log → 1 merchant
- N activity_log → 0..1 company
- N activity_log → 0..1 company_user

---

### 12. **discount_codes**
```sql
CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    cart_id UUID REFERENCES carts(id),
    
    code VARCHAR(255) NOT NULL,
    shopify_discount_id BIGINT,
    
    discount_type VARCHAR(50), -- 'percentage', 'fixed_amount'
    value DECIMAL(12,2),
    
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(merchant_id, code)
);

CREATE INDEX idx_discount_codes_merchant ON discount_codes(merchant_id);
CREATE INDEX idx_discount_codes_company ON discount_codes(company_id);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
```

**İlişkiler:**
- N discount_codes → 1 merchant
- N discount_codes → 0..1 company

---

### 13. **sync_logs**
```sql
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    sync_type VARCHAR(100) NOT NULL, -- 'customers', 'products', 'orders'
    status VARCHAR(50) DEFAULT 'running', -- running, completed, failed
    
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX idx_sync_logs_merchant ON sync_logs(merchant_id);
CREATE INDEX idx_sync_logs_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
```

---

## 🔄 Data Flow Diyagramları

### Flow 1: Shopify → Eagle Sync (Worker)

```
┌─────────────┐
│  Shopify    │
│   Admin     │
│    API      │
└──────┬──────┘
       │
       │ 20 saniye worker
       │ GET /customers, /products, /orders
       │
       ▼
┌──────────────────┐
│  Sync Worker     │
│  (BullMQ)        │
└──────┬───────────┘
       │
       │ INSERT/UPDATE
       │
       ▼
┌──────────────────────────────────┐
│  Eagle PostgreSQL                │
│  - shopify_customers             │
│  - catalog_products/variants     │
│  - orders_local                  │
└──────────────────────────────────┘
```

---

### Flow 2: Snippet Event Collection

```
┌──────────────────┐
│  Shopify Store   │
│  (Customer)      │
└────────┬─────────┘
         │
         │ snippet.js loaded
         │ events: product_view, add_to_cart, search
         │
         ▼
┌─────────────────────────┐
│  POST /events/collect   │
│  api.eagledtfsupply.com │
└────────┬────────────────┘
         │
         │ push to queue
         │
         ▼
┌─────────────────────────┐
│  events_raw_queue       │
│  (BullMQ/Redis)         │
└────────┬────────────────┘
         │
         │ worker-events (batch 100)
         │
         ▼
┌─────────────────────────┐
│  Event Processor        │
│  - eşleştir customer    │
│  - eşleştir company     │
│  - normalize            │
└────────┬────────────────┘
         │
         │ INSERT
         │
         ▼
┌──────────────────┐
│  activity_log    │
└──────────────────┘
```

---

### Flow 3: Pricing Calculation Engine

```
┌──────────────────────────┐
│  Firma Paneli            │
│  Product List / Cart     │
└────────┬─────────────────┘
         │
         │ GET /pricing/calculate
         │ { company_id, variant_ids[], qty }
         │
         ▼
┌──────────────────────────────┐
│  Pricing Engine Service      │
│  1. Fetch list price         │
│  2. Find applicable rules    │
│  3. Apply best rule          │
│  4. Return calculated price  │
└────────┬─────────────────────┘
         │
         │ response:
         │ { variant_id, list_price, company_price, discount%, rule_id }
         │
         ▼
┌──────────────────────────┐
│  Frontend UI             │
│  Show strike-through     │
│  Show company price      │
└──────────────────────────┘
```

---

### Flow 4: Eagle Cart → Shopify Checkout

```
┌────────────────────────┐
│  Firma Paneli          │
│  Cart Items            │
└──────┬─────────────────┘
       │
       │ 1. "Ödeme Yap" button
       │
       ▼
┌───────────────────────────────┐
│  Cart Service                 │
│  - Calculate total            │
│  - Apply pricing rules        │
│  - eagle_total vs shopify_total
└──────┬────────────────────────┘
       │
       │ 2. discount_amount = shopify - eagle
       │
       ▼
┌───────────────────────────────┐
│  Discount Engine              │
│  - Generate/fetch code        │
│  - Shopify Admin API update   │
└──────┬────────────────────────┘
       │
       │ 3. Shopify Storefront API
       │    cartCreate({ lines, discountCodes })
       │
       ▼
┌───────────────────────────────┐
│  Shopify Cart                 │
│  → checkoutUrl                │
└──────┬────────────────────────┘
       │
       │ 4. Redirect user
       │
       ▼
┌───────────────────────────────┐
│  Shopify Checkout Page        │
│  (with discount applied)      │
└───────────────────────────────┘
```

---

### Flow 5: Order Webhook → DB Mapping

```
┌──────────────────────┐
│  Shopify Order       │
│  Created/Paid        │
└──────┬───────────────┘
       │
       │ Webhook POST /webhooks/orders/create
       │
       ▼
┌──────────────────────────────┐
│  Webhook Handler             │
│  - Parse order data          │
│  - Find shopify_customer_id  │
└──────┬───────────────────────┘
       │
       │ Lookup company_user by shopify_customer_id
       │
       ▼
┌──────────────────────────────┐
│  Company/User Matcher        │
│  - company_id found?         │
│  - company_user_id found?    │
│  - cart_id linked?           │
└──────┬───────────────────────┘
       │
       │ INSERT orders_local
       │ UPDATE cart (status=converted)
       │
       ▼
┌──────────────────────────────┐
│  orders_local table          │
│  (firma ve kullanıcıyla      │
│   bağlantılı)                │
└──────────────────────────────┘
```

---

## 🧩 Servis Mimarisi

### Backend Services (NestJS Modules)

```
eagle-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/                      # JWT, OAuth2, guards
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── shopify-oauth.service.ts
│   ├── merchants/                 # Merchant management
│   │   ├── merchants.module.ts
│   │   ├── merchants.service.ts
│   │   ├── merchants.controller.ts
│   │   └── dto/
│   ├── shopify/                   # Shopify API integration
│   │   ├── shopify.module.ts
│   │   ├── shopify.service.ts
│   │   ├── shopify-graphql.service.ts
│   │   └── shopify-rest.service.ts
│   ├── sync/                      # Data sync workers
│   │   ├── sync.module.ts
│   │   ├── sync.service.ts
│   │   ├── workers/
│   │   │   ├── customers-sync.worker.ts
│   │   │   ├── products-sync.worker.ts
│   │   │   └── orders-sync.worker.ts
│   │   └── sync.controller.ts
│   ├── customers/                 # Shopify customers
│   │   ├── customers.module.ts
│   │   ├── customers.service.ts
│   │   └── customers.controller.ts
│   ├── companies/                 # B2B Companies
│   │   ├── companies.module.ts
│   │   ├── companies.service.ts
│   │   ├── companies.controller.ts
│   │   └── dto/
│   ├── company-users/             # Company users & roles
│   │   ├── company-users.module.ts
│   │   ├── company-users.service.ts
│   │   ├── company-users.controller.ts
│   │   └── dto/
│   ├── catalog/                   # Products & variants
│   │   ├── catalog.module.ts
│   │   ├── products.service.ts
│   │   ├── variants.service.ts
│   │   └── catalog.controller.ts
│   ├── pricing/                   # Pricing engine
│   │   ├── pricing.module.ts
│   │   ├── pricing.service.ts
│   │   ├── pricing-rules.service.ts
│   │   ├── pricing-calculator.service.ts
│   │   ├── pricing.controller.ts
│   │   └── dto/
│   ├── carts/                     # Eagle cart management
│   │   ├── carts.module.ts
│   │   ├── carts.service.ts
│   │   ├── cart-items.service.ts
│   │   ├── carts.controller.ts
│   │   └── dto/
│   ├── checkout/                  # Checkout & discount engine
│   │   ├── checkout.module.ts
│   │   ├── checkout.service.ts
│   │   ├── discount-engine.service.ts
│   │   ├── checkout.controller.ts
│   │   └── dto/
│   ├── orders/                    # Order management
│   │   ├── orders.module.ts
│   │   ├── orders.service.ts
│   │   └── orders.controller.ts
│   ├── events/                    # Event collection & processing
│   │   ├── events.module.ts
│   │   ├── events.service.ts
│   │   ├── events.controller.ts
│   │   ├── workers/
│   │   │   └── events-processor.worker.ts
│   │   └── dto/
│   ├── analytics/                 # Analytics & reports
│   │   ├── analytics.module.ts
│   │   ├── analytics.service.ts
│   │   └── analytics.controller.ts
│   ├── webhooks/                  # Shopify webhooks
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.controller.ts
│   │   └── handlers/
│   │       ├── orders.handler.ts
│   │       ├── customers.handler.ts
│   │       └── products.handler.ts
│   ├── snippet/                   # Snippet serving
│   │   ├── snippet.module.ts
│   │   ├── snippet.controller.ts
│   │   └── snippet.service.ts
│   ├── prisma/                    # Prisma ORM
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── redis/                     # Redis & BullMQ
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   └── common/                    # Shared utilities
│       ├── decorators/
│       ├── filters/
│       ├── guards/
│       ├── interceptors/
│       └── pipes/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

---

## 📱 Frontend Yapısı

### Admin Panel (app.eagledtfsupply.com)

```
eagle-admin/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Dashboard
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/              # Shopify OAuth callback
│   ├── dashboard/
│   │   └── page.tsx               # Ana dashboard
│   ├── companies/
│   │   ├── page.tsx               # Companies list + Shopify customers
│   │   ├── [id]/
│   │   │   └── page.tsx           # Company detail
│   │   └── components/
│   ├── pricing/
│   │   ├── page.tsx               # Pricing rules list
│   │   ├── new/
│   │   └── [id]/edit/
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── catalog/
│   │   ├── products/
│   │   └── sync/
│   ├── analytics/
│   │   └── page.tsx
│   ├── settings/
│   │   ├── page.tsx               # Snippet, sync, general
│   │   └── components/
│   └── api/                       # API routes (optional)
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── layouts/
│   ├── tables/
│   ├── forms/
│   └── charts/
├── lib/
│   ├── api-client.ts              # Axios instance
│   ├── auth.ts
│   └── utils.ts
├── hooks/
├── stores/                        # Zustand stores
├── types/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

### Firma Paneli (accounts.eagledtfsupply.com)

```
eagle-accounts/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Login / Landing
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── invitation/[token]/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── products/
│   │   ├── page.tsx               # Product list with company pricing
│   │   └── [id]/
│   ├── cart/
│   │   └── page.tsx               # Eagle cart
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── quotes/                    # RFQ system (optional)
│   │   └── page.tsx
│   ├── team/                      # Sub-users management
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── settings/
├── components/
│   ├── ui/
│   ├── product-card.tsx
│   ├── cart-item.tsx
│   └── pricing-display.tsx
├── lib/
├── hooks/
├── stores/
├── types/
├── package.json
└── next.config.js
```

---

### Snippet (cdn.eagledtfsupply.com/snippet.js)

```
eagle-snippet/
├── src/
│   ├── index.ts                   # Entry point
│   ├── core/
│   │   ├── init.ts                # Initialize snippet
│   │   ├── auth.ts                # Eagle token handling
│   │   └── config.ts
│   ├── events/
│   │   ├── tracker.ts             # Event tracking
│   │   ├── product-view.ts
│   │   ├── add-to-cart.ts
│   │   ├── search.ts
│   │   └── cart-sync.ts
│   ├── ui/
│   │   ├── pricing-display.ts     # Show company pricing
│   │   ├── badges.ts              # B2B badges
│   │   └── cart-widget.ts
│   ├── api/
│   │   └── client.ts              # POST events to backend
│   └── utils/
├── dist/                          # Build output
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Deployment & Infrastructure Plan

### Server Setup (Ubuntu 22.04 LTS - Hetzner)

**Server IP:** 5.78.148.183  
**SSH:** `ssh root@5.78.148.183 -i ~/.ssh/hetzner_gsb`

#### Initial Server Setup

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install PostgreSQL 16
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16

# 4. Install Redis 7
apt install -y redis-server

# 5. Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

# 6. Install PM2
npm install -g pm2

# 7. Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

### Caddy Configuration

**File:** `/etc/caddy/Caddyfile`

```caddy
# Admin Panel
app.eagledtfsupply.com {
    reverse_proxy localhost:3000
    encode gzip
    log {
        output file /var/log/caddy/app.log
    }
}

# Firma Panel
accounts.eagledtfsupply.com {
    reverse_proxy localhost:3001
    encode gzip
    log {
        output file /var/log/caddy/accounts.log
    }
}

# Backend API
api.eagledtfsupply.com {
    reverse_proxy localhost:4000
    encode gzip
    log {
        output file /var/log/caddy/api.log
    }
}

# CDN / Static (Snippet)
cdn.eagledtfsupply.com {
    root * /var/www/eagle/cdn
    file_server
    encode gzip
    header {
        Access-Control-Allow-Origin *
        Access-Control-Allow-Methods "GET, OPTIONS"
        Cache-Control "public, max-age=31536000"
    }
}
```

---

### PostgreSQL Setup

```bash
# Login as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE eagle_db;
CREATE USER eagle_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE eagle_db TO eagle_user;
\q

# Enable remote access (optional, for dev)
# Edit /etc/postgresql/16/main/postgresql.conf
# listen_addresses = 'localhost'

# Edit /etc/postgresql/16/main/pg_hba.conf
# Add: host  eagle_db  eagle_user  0.0.0.0/0  scram-sha-256
```

---

### Redis Setup

```bash
# Edit /etc/redis/redis.conf
# bind 127.0.0.1
# requirepass YOUR_REDIS_PASSWORD

# Restart Redis
systemctl restart redis-server
systemctl enable redis-server
```

---

### Directory Structure on Server

```
/var/www/eagle/
├── backend/                 # NestJS backend
├── admin/                   # Next.js admin build
├── accounts/                # Next.js accounts build
├── cdn/                     # Static snippet files
├── .env.production
└── ecosystem.config.js      # PM2 config
```

---

### PM2 Ecosystem Config

**File:** `/var/www/eagle/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'eagle-api',
      cwd: '/var/www/eagle/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'eagle-admin',
      cwd: '/var/www/eagle/admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'eagle-accounts',
      cwd: '/var/www/eagle/accounts',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

---

### GitHub Actions CI/CD

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Hetzner

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.HETZNER_SSH_KEY }}
      
      - name: Deploy Backend
        run: |
          ssh -o StrictHostKeyChecking=no root@5.78.148.183 << 'EOF'
            cd /var/www/eagle
            git pull origin main
            
            # Backend
            cd backend
            npm install
            npx prisma migrate deploy
            npm run build
            
            # Admin
            cd ../admin
            npm install
            npm run build
            
            # Accounts
            cd ../accounts
            npm install
            npm run build
            
            # Snippet
            cd ../snippet
            npm install
            npm run build
            cp -r dist/* /var/www/eagle/cdn/
            
            # Restart PM2
            pm2 restart ecosystem.config.js
          EOF
```

---

## 📝 İş Akış Planı (Development Roadmap)

### **Phase 1: Infrastructure Setup (Gün 1-2)**

#### 1.1 Git & Project Init
- [ ] Git repo initialize
- [ ] Monorepo structure (turborepo veya pnpm workspace)
- [ ] .gitignore, .env.example
- [ ] README.md

#### 1.2 Backend Base
- [ ] NestJS project init
- [ ] Prisma setup
- [ ] Database schema tanımlama
- [ ] Migration run
- [ ] Auth module (JWT)
- [ ] Shopify OAuth flow

#### 1.3 Frontend Base
- [ ] Admin panel Next.js init
- [ ] Firma panel Next.js init
- [ ] shadcn/ui kurulum
- [ ] TailwindCSS config
- [ ] API client setup

#### 1.4 Snippet Base
- [ ] Vite/TypeScript project
- [ ] Basic event tracker
- [ ] Build config

---

### **Phase 2: Shopify Integration & Sync (Gün 3-5)**

#### 2.1 Shopify API Module
- [ ] Shopify REST client
- [ ] Shopify GraphQL client
- [ ] OAuth install flow
- [ ] Access token storage

#### 2.2 Data Sync Workers
- [ ] BullMQ setup
- [ ] Customer sync worker (ilk import)
- [ ] Product sync worker (ilk import)
- [ ] Order sync worker (ilk import)
- [ ] Continuous sync (20 saniye interval)

#### 2.3 Admin Panel - Settings
- [ ] Settings page
- [ ] Initial sync button
- [ ] Sync status display
- [ ] Snippet code display
- [ ] App embed check

---

### **Phase 3: Company Management (Gün 6-8)**

#### 3.1 Companies Module (Backend)
- [ ] CRUD operations
- [ ] Company status management
- [ ] Company groups

#### 3.2 Company Users Module
- [ ] User CRUD
- [ ] Role & permissions
- [ ] Invitation system
- [ ] Password reset

#### 3.3 Admin Panel - Companies Tab
- [ ] Companies list
- [ ] Shopify customers list (dual view)
- [ ] "Davet et" action
- [ ] "Firmaya bağla" action
- [ ] "Özel fiyat tanımla" action
- [ ] Company detail page

#### 3.4 Firma Panel - Auth
- [ ] Login page
- [ ] Invitation accept flow
- [ ] Dashboard

---

### **Phase 4: Catalog & Product Display (Gün 9-11)**

#### 4.1 Catalog Module (Backend)
- [ ] Products CRUD
- [ ] Variants handling
- [ ] Search & filters

#### 4.2 Admin Panel - Catalog
- [ ] Products list
- [ ] Sync status

#### 4.3 Firma Panel - Products
- [ ] Product list (with basic pricing)
- [ ] Product detail
- [ ] Search & filters

---

### **Phase 5: Pricing Engine (Gün 12-15)**

#### 5.1 Pricing Rules Module (Backend)
- [ ] Pricing rules CRUD
- [ ] Rule types implementation
- [ ] Priority & conflict resolution
- [ ] Date validation

#### 5.2 Pricing Calculator Service
- [ ] Single product pricing
- [ ] Batch pricing
- [ ] Quantity breaks
- [ ] Cart-total based rules

#### 5.3 Admin Panel - Pricing
- [ ] Pricing rules list
- [ ] Create pricing rule form
- [ ] Edit/Delete rules
- [ ] Preview/test calculator

#### 5.4 Firma Panel - Pricing Display
- [ ] Show company price vs list price
- [ ] Discount badge
- [ ] "You save X%" indicator

---

### **Phase 6: Cart System (Gün 16-19)**

#### 6.1 Cart Module (Backend)
- [ ] Cart CRUD
- [ ] Cart items management
- [ ] Cart calculation with pricing rules
- [ ] Approval workflow

#### 6.2 Firma Panel - Cart
- [ ] Add to cart
- [ ] Cart page
- [ ] Update quantity
- [ ] Remove item
- [ ] Show applied rules
- [ ] "Onaya gönder" button (if enabled)
- [ ] Cart approval flow (admin role)

---

### **Phase 7: Checkout & Discount Engine (Gün 20-23)**

#### 7.1 Discount Engine (Backend)
- [ ] Discount code generation
- [ ] Shopify Admin API integration (discount creation)
- [ ] Discount mapping to cart

#### 7.2 Checkout Service
- [ ] Calculate eagle_total vs shopify_total
- [ ] Apply discount code
- [ ] Shopify Storefront API cartCreate
- [ ] Generate checkoutUrl

#### 7.3 Firma Panel - Checkout
- [ ] "Ödeme Yap" button
- [ ] Redirect to Shopify checkout

---

### **Phase 8: Order Management & Webhooks (Gün 24-26)**

#### 8.1 Webhooks Module (Backend)
- [ ] Webhook validation
- [ ] orders/create handler
- [ ] orders/paid handler
- [ ] orders/updated handler
- [ ] customers/create handler
- [ ] products/update handler

#### 8.2 Order Mapping
- [ ] Shopify order → orders_local
- [ ] Eşleştirme: shopify_customer → company
- [ ] Cart linkage (converted)

#### 8.3 Admin Panel - Orders
- [ ] Orders list
- [ ] Filter by company
- [ ] Order detail

#### 8.4 Firma Panel - Orders
- [ ] Orders history
- [ ] Order detail
- [ ] Reorder functionality

---

### **Phase 9: Event Tracking & Analytics (Gün 27-30)**

#### 9.1 Events Module (Backend)
- [ ] Event collection endpoint
- [ ] Event queue (BullMQ)
- [ ] Event processor worker
- [ ] Event → Company/User eşleştirme
- [ ] activity_log storage

#### 9.2 Snippet - Event Tracking
- [ ] Product view tracking
- [ ] Add to cart tracking
- [ ] Search tracking
- [ ] Session management
- [ ] Eagle token handling

#### 9.3 Analytics Service (Backend)
- [ ] Event aggregation
- [ ] Funnel analysis
- [ ] Product performance
- [ ] Company activity

#### 9.4 Admin Panel - Analytics
- [ ] Dashboard widgets
- [ ] Event logs
- [ ] Funnel visualizations
- [ ] Company reports

---

### **Phase 10: Snippet UI Customization (Gün 31-33)**

#### 10.1 Snippet - Pricing Display
- [ ] Inject company pricing to product pages
- [ ] Strike-through list price
- [ ] Show discount percentage

#### 10.2 Snippet - Cart Sync
- [ ] Listen Shopify cart changes
- [ ] Sync to Eagle cart
- [ ] Show Eagle cart widget (optional)

#### 10.3 Snippet - Badges & Visibility
- [ ] B2B badges for logged-in users
- [ ] Hide/show products based on rules
- [ ] Custom campaigns

---

### **Phase 11: Testing & Bug Fixes (Gün 34-36)**

#### 11.1 Unit Tests
- [ ] Backend services
- [ ] Pricing calculator
- [ ] Discount engine

#### 11.2 Integration Tests
- [ ] Shopify API mocks
- [ ] Webhook handlers
- [ ] Cart → Checkout flow

#### 11.3 E2E Tests
- [ ] Admin panel flows
- [ ] Firma panel flows
- [ ] Snippet behavior

#### 11.4 Bug Fixes
- [ ] Fix critical bugs
- [ ] Performance optimization

---

### **Phase 12: Deployment (Gün 37-38)**

#### 12.1 Server Setup
- [ ] Ubuntu server setup
- [ ] Install dependencies (Node, PostgreSQL, Redis, Caddy, PM2)
- [ ] Configure firewall
- [ ] Setup SSL (via Caddy)

#### 12.2 Database Migration
- [ ] Run Prisma migrations on production
- [ ] Seed data (if needed)

#### 12.3 Deploy Applications
- [ ] Build backend
- [ ] Build admin panel
- [ ] Build firma panel
- [ ] Build snippet
- [ ] Copy to server
- [ ] PM2 start

#### 12.4 DNS & Domain Setup
- [ ] Point domains to server IP
- [ ] Verify SSL
- [ ] Test all endpoints

#### 12.5 GitHub Actions
- [ ] Setup CI/CD pipeline
- [ ] Test auto-deploy

---

### **Phase 13: Documentation & Launch (Gün 39-40)**

#### 13.1 Documentation
- [ ] API documentation (Swagger)
- [ ] Admin panel user guide
- [ ] Firma panel user guide
- [ ] Developer guide (snippet integration)

#### 13.2 Final Testing
- [ ] Full system test
- [ ] Performance test
- [ ] Security audit

#### 13.3 Launch
- [ ] Shopify App Store submission (optional)
- [ ] Go live
- [ ] Monitor logs

---

## 🔒 Security Considerations

### Backend
- JWT expiration & refresh tokens
- Rate limiting (express-rate-limit)
- Input validation (class-validator)
- SQL injection prevention (Prisma parameterized queries)
- CORS configuration
- Helmet.js
- Webhook signature verification

### Frontend
- XSS prevention (React default escaping)
- CSRF tokens (for forms)
- Secure cookie storage (httpOnly, secure)
- Environment variable protection

### Snippet
- Content Security Policy (CSP) compliance
- No sensitive data in localStorage
- HTTPS only

---

## 📊 Performance Optimization

### Backend
- Database indexing (see schema above)
- Redis caching (product catalog, pricing rules)
- BullMQ for async tasks
- Pagination on all lists
- GraphQL for efficient data fetching (optional)

### Frontend
- Next.js SSR/SSG where applicable
- Image optimization (next/image)
- Code splitting
- Lazy loading
- TanStack Query for caching

### Snippet
- Minified & gzipped
- CDN delivery
- Debounced event tracking
- Lazy initialization

---

## 🧪 Testing Strategy

### Backend
- **Unit Tests:** Jest + NestJS Testing
- **Integration Tests:** Supertest
- **E2E Tests:** Playwright (optional)

### Frontend
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright

### Snippet
- **Unit Tests:** Vitest
- **Browser Tests:** Playwright

---

## 📈 Monitoring & Logging

### Application Logging
- Winston or Pino (structured logging)
- Log levels: error, warn, info, debug
- Log rotation

### PM2 Monitoring
- PM2 logs: `pm2 logs`
- PM2 monit: `pm2 monit`
- PM2 Plus (optional cloud monitoring)

### Error Tracking
- Sentry integration (optional)

### Analytics
- Custom dashboard (Eagle analytics module)

---

## 🎨 UI/UX Guidelines

### Admin Panel
- **Theme:** Professional, clean, data-focused
- **Colors:** Primary blue (#3B82F6), secondary gray
- **Components:** Tables, charts, forms
- **Responsiveness:** Desktop-first (1280px+)

### Firma Panel
- **Theme:** Modern e-commerce style
- **Colors:** Brand colors (customizable per merchant)
- **Components:** Product cards, cart, order history
- **Responsiveness:** Mobile-friendly

### Snippet UI
- **Theme:** Matches Shopify store theme
- **Colors:** Inherit or subtle accent
- **Components:** Minimal overlays, badges
- **Performance:** < 50kb gzipped

---

## 🚦 API Endpoints Reference (High-Level)

### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/shopify/install`
- `GET /auth/shopify/callback`

### Merchants
- `GET /merchants/me`
- `PATCH /merchants/me`

### Shopify Customers
- `GET /customers` (list)
- `GET /customers/:id`
- `POST /customers/sync` (manual trigger)

### Companies
- `GET /companies`
- `POST /companies`
- `GET /companies/:id`
- `PATCH /companies/:id`
- `DELETE /companies/:id`
- `POST /companies/:id/invite` (invite user)

### Company Users
- `GET /companies/:companyId/users`
- `POST /companies/:companyId/users`
- `PATCH /company-users/:id`
- `DELETE /company-users/:id`

### Catalog
- `GET /catalog/products`
- `GET /catalog/products/:id`
- `GET /catalog/variants/:id`

### Pricing
- `GET /pricing/rules`
- `POST /pricing/rules`
- `GET /pricing/rules/:id`
- `PATCH /pricing/rules/:id`
- `DELETE /pricing/rules/:id`
- `POST /pricing/calculate` (calculate price for variants)

### Carts
- `GET /carts`
- `POST /carts`
- `GET /carts/:id`
- `PATCH /carts/:id`
- `DELETE /carts/:id`
- `POST /carts/:id/items`
- `PATCH /carts/:id/items/:itemId`
- `DELETE /carts/:id/items/:itemId`
- `POST /carts/:id/approve`

### Checkout
- `POST /checkout/create` (Eagle → Shopify)

### Orders
- `GET /orders`
- `GET /orders/:id`

### Events
- `POST /events/collect` (snippet events)

### Analytics
- `GET /analytics/dashboard`
- `GET /analytics/events`
- `GET /analytics/funnel`

### Webhooks
- `POST /webhooks/orders/create`
- `POST /webhooks/orders/paid`
- `POST /webhooks/customers/create`
- `POST /webhooks/products/update`

### Snippet
- `GET /snippet.js?shop=...`

---

## 🔗 External API Dependencies

### Shopify Admin API (2025)
- **Authentication:** OAuth2
- **Rate Limits:** 2 requests/second (REST), 1000 points/minute (GraphQL)
- **Endpoints:**
  - Customers: GET /admin/api/2025-01/customers.json
  - Products: GET /admin/api/2025-01/products.json
  - Orders: GET /admin/api/2025-01/orders.json
  - Discounts: POST /admin/api/2025-01/price_rules.json
- **Webhooks:**
  - orders/create
  - orders/paid
  - customers/create
  - products/update

### Shopify Storefront API (2025)
- **Authentication:** Storefront Access Token
- **Endpoints:**
  - cartCreate
  - cartLinesAdd
  - cartDiscountCodesUpdate

---

## 🗂️ Environment Variables

### Backend (.env)

```env
# App
NODE_ENV=production
PORT=4000
API_URL=https://api.eagledtfsupply.com
ADMIN_URL=https://app.eagledtfsupply.com
ACCOUNTS_URL=https://accounts.eagledtfsupply.com

# Database
DATABASE_URL=postgresql://eagle_user:PASSWORD@localhost:5432/eagle_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# JWT
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_EXPIRES_IN=7d

# Shopify
SHOPIFY_API_KEY=YOUR_SHOPIFY_API_KEY
SHOPIFY_API_SECRET=YOUR_SHOPIFY_API_SECRET
SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers,read_orders,write_orders,write_price_rules,write_discounts

# CDN
CDN_URL=https://cdn.eagledtfsupply.com
```

### Admin Panel (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com
NEXT_PUBLIC_SHOPIFY_INSTALL_URL=https://api.eagledtfsupply.com/auth/shopify/install
```

### Firma Panel (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.eagledtfsupply.com
```

---

## 🎯 Success Metrics (KPIs)

### Technical
- API response time < 200ms (p95)
- Uptime > 99.9%
- Database query time < 50ms (avg)
- Event processing < 5s (p95)

### Business
- Merchant onboarding time < 10 minutes
- Company setup time < 5 minutes
- Checkout conversion rate (track via analytics)
- Average order value (B2B vs B2C)

---

## 🚧 Future Enhancements (Post-MVP)

1. **Multi-language support** (i18n)
2. **Multi-currency pricing**
3. **Quote/RFQ system** (request for quote)
4. **Credit limit management**
5. **Approval workflows** (multi-level)
6. **Invoice management**
7. **Payment terms** (net 30, net 60)
8. **Advanced analytics** (ML-based recommendations)
9. **Mobile apps** (React Native)
10. **API webhooks for merchants**
11. **Marketplace integrations** (beyond Shopify)
12. **White-label solution**

---

## 📚 Tech Stack Versions (Lock)

```json
{
  "node": "20.11.0",
  "npm": "10.2.4",
  "typescript": "5.3.3",
  "nest": "10.3.0",
  "react": "18.2.0",
  "next": "14.1.0",
  "prisma": "5.8.0",
  "postgresql": "16.1",
  "redis": "7.2.3",
  "caddy": "2.7.6",
  "pm2": "5.3.0"
}
```

---

## 🏁 Proje Başlangıç Checklist

- [ ] Git repo oluştur
- [ ] README.md, PROJECT_MASTER_PLAN.md commit et
- [ ] Backend NestJS scaffold
- [ ] Prisma schema yaz
- [ ] Admin panel Next.js scaffold
- [ ] Firma panel Next.js scaffold
- [ ] Snippet Vite scaffold
- [ ] .env.example dosyaları oluştur
- [ ] GitHub Actions workflow ekle
- [ ] İlk commit & push

---

## 📞 İletişim & Destek

**Geliştirici:** jesuisfatih  
**GitHub:** git@github.com:jesuisfatih/eagle-engine.dev.git  
**Server:** 5.78.148.183 (Hetzner)  

---

## 📜 Lisans

Proprietary - Tüm hakları saklıdır.

---

## ✅ Sonuç

Bu plan, Eagle B2B Commerce Engine'in tam kapsamlı geliştirilmesi, deploy edilmesi ve canlıya alınması için gereken tüm adımları, teknik detayları, veritabanı şemalarını, servis mimarisini, data flow diyagramlarını ve iş akışını içermektedir.

**Toplam Tahmini Süre:** 40 gün (full-time)  
**Minimum Ekip:** 1 Full-Stack Developer (veya 2-3 uzman)

Projeye bu plana sadık kalarak aşama aşama başlayacağız. Her phase tamamlandıkça commit edilecek ve sunucuya deploy edilecektir.

---

**🦅 Let's build Eagle!**

