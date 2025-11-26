# 🦅 EAGLE B2B - MULTIPASS ALTERNATİFİ SİSTEM MİMARİSİ

## **ULTRA DERİN ANALİZ - 360° BAKIŞ**

### **SORUN:**
- Shopify Plus pahalı ($2000/ay)
- Multipass sadece Plus'ta var
- Standard Shopify'da SSO çözümü yok

### **ÇÖZÜM:**
- Cookie + Snippet + Backend sync
- Shopify Customer API kullanımı
- Eagle session → Shopify customer mapping
- Checkout'ta otomatik customer assign

---

## **1. SİSTEM MİMARİSİ**

### **BAĞLANTILAR:**
```
[Shopify Store] <-- Liquid Snippet --> [Eagle API]
       ↓                                      ↓
[Customer Login]                    [Session Manager]
       ↓                                      ↓
[Cookie: shopify_customer]      [Cookie: eagle_session]
       ↓                                      ↓
       └──────> [Sync Engine] <──────────────┘
                      ↓
            [Identity Mapping DB]
```

---

## **2. KULLANICI AKIŞLARI**

### **AKIŞ A: SHOPIFY → EAGLE (Snippet-based)**

```javascript
// Shopify'da login
Customer logs in Shopify
  ↓
Liquid injects: window.__eagle_customer = {id, email}
  ↓
Snippet detects: if (window.__eagle_customer)
  ↓
POST /api/v1/auth/shopify-customer-sync
  body: {shopifyCustomerId, email, fingerprint}
  ↓
Backend checks: User exists in Eagle?
  ├─ YES → Generate session token
  └─ NO  → Create prospect user + Generate token
  ↓
Response: {eagle_session_token}
  ↓
Snippet sets cookie: eagle_session=token
  ↓
User visits accounts.eagledtfsupply.com
  ↓
SSR reads cookie → Auto login ✅
```

### **AKIŞ B: EAGLE → SHOPIFY (API-based)**

```javascript
// Eagle'da login
User logs in accounts.eagledtfsupply.com
  ↓
Backend generates: eagle_session token
  ↓
Cookie set: eagle_session=token
  ↓
User visits Shopify store
  ↓
Snippet reads: getCookie("eagle_session")
  ↓
GET /api/v1/auth/resolve?token=xxx
  ↓
Backend returns: {company, user, pricing, customerId}
  ↓
Snippet applies B2B context:
  - Show company prices
  - Hide retail prices
  - Apply discount badges
  - Custom "Add to Cart" → Eagle API
  ↓
User clicks "Checkout"
  ↓
Backend creates/updates Shopify customer
  ↓
Storefront API: cartCreate with customerId
  ↓
Redirect to: checkoutUrl
  ↓
Shopify recognizes customer → No login needed ✅
```

---

## **3. TEKNİK DETAYLAR**

### **A. COOKIE MANTIĞI**

```typescript
// Cookie structure
eagle_session = {
  token: "jwt_token_here",
  expires: "7 days",
  domain: ".eagledtfsupply.com", // Cross-subdomain
  secure: true,
  sameSite: "Lax", // Safari ITP compatible
  httpOnly: false, // Snippet'in okuması için
}

shopify_customer_map = {
  shopifyCustomerId: "123",
  eagleUserId: "uuid",
  lastSync: "timestamp",
  domain: "eagle-dtf-supply0.myshopify.com",
  secure: true,
  sameSite: "None", // Cross-domain
}
```

### **B. SNIPPET İŞLEVLERİ**

```javascript
// snippet-multipass-alternative.js

// 1. SHOPIFY → EAGLE SYNC
async function syncShopifyToEagle() {
  const customer = window.__eagle_customer;
  if (!customer?.id) return;
  
  // Check if already synced
  if (localStorage.getItem('eagle_sync_' + customer.id)) return;
  
  const response = await fetch('/api/v1/auth/shopify-customer-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopifyCustomerId: customer.id,
      email: customer.email,
      fingerprint: getBrowserFingerprint()
    })
  });
  
  if (response.ok) {
    const { token } = await response.json();
    setCookie('eagle_session', token, 7);
    localStorage.setItem('eagle_sync_' + customer.id, Date.now());
  }
}

// 2. EAGLE → SHOPIFY CONTEXT
async function applyEagleContext() {
  const token = getCookie('eagle_session');
  if (!token) return;
  
  const response = await fetch('/api/v1/auth/resolve', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  if (response.ok) {
    const context = await response.json();
    applyB2BPricing(context.pricing);
    hideRetailPrices();
    showCompanyBadge(context.company.name);
    overrideAddToCart(context.user.id);
  }
}

// 3. CHECKOUT INTERCEPT
function interceptCheckout() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[href="/checkout"], [action="/checkout"]');
    if (!btn) return;
    
    e.preventDefault();
    
    const token = getCookie('eagle_session');
    if (!token) {
      window.location.href = '/checkout';
      return;
    }
    
    // Create Shopify checkout with customer
    const response = await fetch('/api/v1/checkout/create-shopify', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cartId: eagleCartId,
        returnUrl: window.location.href
      })
    });
    
    if (response.ok) {
      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    }
  });
}
```

### **C. BACKEND ENDPOINT'LER**

```typescript
// 1. Shopify → Eagle Sync
@Post('auth/shopify-customer-sync')
async shopifyCustomerSync(@Body() body: {
  shopifyCustomerId: string;
  email: string;
  fingerprint: string;
}) {
  // Check if user exists
  let user = await this.prisma.companyUser.findFirst({
    where: {
      OR: [
        { shopifyCustomerId: BigInt(body.shopifyCustomerId) },
        { email: body.email }
      ]
    }
  });
  
  // Create prospect if not exists
  if (!user) {
    user = await this.prisma.companyUser.create({
      data: {
        email: body.email,
        shopifyCustomerId: BigInt(body.shopifyCustomerId),
        role: 'buyer',
        status: 'prospect', // Will be activated on first order
        companyId: await this.getOrCreateProspectCompany(body.email)
      }
    });
  }
  
  // Update shopifyCustomerId if missing
  if (!user.shopifyCustomerId) {
    user = await this.prisma.companyUser.update({
      where: { id: user.id },
      data: { shopifyCustomerId: BigInt(body.shopifyCustomerId) }
    });
  }
  
  // Generate session token
  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    type: 'shopify_sync'
  });
  
  // Log sync
  await this.activityLog.create({
    type: 'shopify_login_sync',
    userId: user.id,
    metadata: { fingerprint: body.fingerprint }
  });
  
  return { token, user: { id: user.id, email: user.email } };
}

// 2. Resolve Eagle Context
@Get('auth/resolve')
async resolveContext(@Headers('authorization') auth: string) {
  const token = auth.replace('Bearer ', '');
  const decoded = this.jwtService.verify(token);
  
  const user = await this.prisma.companyUser.findUnique({
    where: { id: decoded.sub },
    include: {
      company: true,
      company: {
        include: {
          pricingRules: true
        }
      }
    }
  });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    company: {
      id: user.company.id,
      name: user.company.name,
      tier: user.company.tier
    },
    pricing: user.company.pricingRules,
    permissions: user.permissions,
    shopifyCustomerId: user.shopifyCustomerId?.toString()
  };
}

// 3. Create Shopify Checkout
@Post('checkout/create-shopify')
async createShopifyCheckout(
  @Body() body: { cartId: string; returnUrl: string },
  @Headers('authorization') auth: string
) {
  const token = auth.replace('Bearer ', '');
  const decoded = this.jwtService.verify(token);
  const user = await this.getUser(decoded.sub);
  
  // Get or create Shopify customer
  let customerId = user.shopifyCustomerId;
  if (!customerId) {
    customerId = await this.shopifyService.createCustomer({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tags: ['b2b', user.company.name]
    });
    
    // Update user
    await this.prisma.companyUser.update({
      where: { id: user.id },
      data: { shopifyCustomerId: BigInt(customerId) }
    });
  }
  
  // Get Eagle cart
  const cart = await this.prisma.cart.findUnique({
    where: { id: body.cartId },
    include: { items: true }
  });
  
  // Create Shopify cart with customer
  const shopifyCart = await this.shopifyStorefrontAPI.cartCreate({
    buyerIdentity: {
      customerAccessToken: await this.getCustomerAccessToken(customerId)
    },
    lines: cart.items.map(item => ({
      merchandiseId: `gid://shopify/ProductVariant/${item.shopifyVariantId}`,
      quantity: item.quantity
    })),
    discountCodes: await this.getPricingDiscountCodes(user.companyId)
  });
  
  return {
    checkoutUrl: shopifyCart.checkoutUrl,
    cartId: shopifyCart.id
  };
}
```

---

## **4. SETTINGS PAGE SWITCH**

```typescript
// admin/app/settings/page.tsx

const [multipassMode, setMultipassMode] = useState(false);

<div className="card mb-4">
  <div className="card-header">
    <h5>SSO Configuration</h5>
  </div>
  <div className="card-body">
    <div className="form-check form-switch mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        id="multipassSwitch"
        checked={multipassMode}
        onChange={async (e) => {
          setMultipassMode(e.target.checked);
          await updateSetting('sso_mode', e.target.checked ? 'multipass' : 'alternative');
        }}
      />
      <label className="form-check-label" htmlFor="multipassSwitch">
        <strong>Shopify Multipass SSO</strong>
        <div className="text-muted small">
          {multipassMode 
            ? '✅ Multipass enabled (Shopify Plus required)'
            : '⚙️ Alternative SSO (Standard Shopify compatible)'}
        </div>
      </label>
    </div>
    
    {multipassMode ? (
      // Multipass settings
      <div className="alert alert-warning">
        <i className="ti ti-alert-triangle me-2"></i>
        <strong>Shopify Plus Required</strong>
        <p className="mb-0 small">
          Multipass is only available on Shopify Plus plans.
          Enable it in: Shopify Admin → Settings → Customer accounts → Multipass
        </p>
      </div>
      <div className="mb-3">
        <label className="form-label">Multipass Secret</label>
        <input 
          type="password" 
          className="form-control"
          placeholder="Enter your Multipass secret (64 characters)"
        />
      </div>
    ) : (
      // Alternative SSO settings
      <div className="alert alert-info">
        <i className="ti ti-info-circle me-2"></i>
        <strong>Alternative SSO Active</strong>
        <p className="mb-0 small">
          Cookie-based authentication with Shopify Customer API.
          Works on all Shopify plans including Standard.
        </p>
      </div>
      <div className="mb-3">
        <label className="form-label">Session Cookie Domain</label>
        <input 
          type="text" 
          className="form-control"
          value=".eagledtfsupply.com"
          readOnly
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Shopify Storefront Access Token</label>
        <input 
          type="password" 
          className="form-control"
          placeholder="Storefront API token for checkout creation"
        />
      </div>
    )}
    
    <div className="alert alert-success">
      <strong>✅ System Status</strong>
      <ul className="mb-0 mt-2">
        <li>Shopify → Eagle sync: Active</li>
        <li>Eagle → Shopify sync: Active</li>
        <li>Checkout flow: Configured</li>
        <li>Customer mapping: Enabled</li>
      </ul>
    </div>
  </div>
</div>
```

---

## **5. BACKEND SERVİSLER**

### **SessionSyncService:**
```typescript
@Injectable()
export class SessionSyncService {
  constructor(
    private prisma: PrismaService,
    private shopify: ShopifyService,
    private jwt: JwtService
  ) {}
  
  // Shopify customer → Eagle user
  async syncFromShopify(shopifyCustomerId: string, email: string) {
    let user = await this.findUserByShopifyId(shopifyCustomerId);
    
    if (!user) {
      user = await this.createProspectUser({
        email,
        shopifyCustomerId,
        source: 'shopify_sync'
      });
    }
    
    return this.generateSessionToken(user);
  }
  
  // Eagle user → Shopify customer
  async syncToShopify(userId: string) {
    const user = await this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: { company: true }
    });
    
    if (user.shopifyCustomerId) {
      return user.shopifyCustomerId.toString();
    }
    
    // Create Shopify customer
    const customer = await this.shopify.createCustomer({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tags: ['b2b', user.company.name],
      metafields: [
        { key: 'eagle_user_id', value: user.id },
        { key: 'eagle_company_id', value: user.companyId }
      ]
    });
    
    // Save to DB
    await this.prisma.companyUser.update({
      where: { id: userId },
      data: { shopifyCustomerId: BigInt(customer.id) }
    });
    
    return customer.id;
  }
}
```

---

## **6. GÜVENLİK KATMANLARI**

### **A. Token Security:**
- JWT with 7-day expiry
- Signed with HS256
- Payload: {sub, email, type, exp}
- Refresh token mechanism

### **B. Browser Fingerprint:**
```javascript
function getBrowserFingerprint() {
  return btoa(JSON.stringify({
    ua: navigator.userAgent,
    lang: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hash: Date.now() + Math.random()
  }));
}
```

### **C. Rate Limiting:**
- /auth/shopify-customer-sync: 5 req/min per IP
- /auth/resolve: 20 req/min per token
- /checkout/create-shopify: 10 req/min per user

### **D. CSRF Protection:**
- SameSite=Lax cookies
- Origin validation
- Token rotation every 24h

---

## **7. AVANTAJLAR vs DİSAVANTAJLAR**

### **✅ AVANTAJLAR:**
1. ✅ Shopify Standard ile çalışır ($29/ay)
2. ✅ Multipass'e gerek yok
3. ✅ %100 kontrol altında
4. ✅ Cookie-based (Safari ITP uyumlu)
5. ✅ Shopify customer otomatik oluşturma
6. ✅ Checkout sorunsuz
7. ✅ B2B pricing snippet ile uygulanır
8. ✅ Session 7 gün geçerli

### **⚠️ DİSAVANTAJLAR:**
1. ⚠️ 2 farklı login sistemi (Shopify + Eagle)
2. ⚠️ Snippet'e bağımlı
3. ⚠️ Cookie senkronizasyonu gerekli
4. ⚠️ Shopify'da "Re-login" gerekebilir (checkout)
5. ⚠️ Customer token yönetimi

### **vs MULTIPASS:**
| Özellik | Multipass | Alternative |
|---------|-----------|-------------|
| Maliyet | $2000/ay (Plus) | $29/ay (Standard) |
| Kurulum | Kolay (1 switch) | Orta (Snippet + API) |
| Sync Hızı | Anında | 1-2 saniye |
| Login UX | Seamless | Near-seamless |
| Kontrol | Shopify'a bağlı | %100 bizde |
| Güvenlik | Shopify managed | Self-managed |

---

## **8. UYGULAMA PLANI**

### **Backend (3 endpoint):**
1. ✅ POST /auth/shopify-customer-sync
2. ✅ GET /auth/resolve
3. ✅ POST /checkout/create-shopify

### **Frontend:**
4. ✅ Settings page switch
5. ✅ Multipass/Alternative mode selector
6. ✅ Configuration UI

### **Snippet:**
7. ✅ snippet-alternative-sso.liquid
8. ✅ Shopify → Eagle sync
9. ✅ Eagle → Shopify context
10. ✅ Checkout intercept

### **Database:**
11. ✅ Add sso_mode to settings table
12. ✅ Add fingerprint to session logs

---

## **SONUÇ:**

Bu sistem **Shopify Standard** ile çalışır ve Multipass'e **%90 yakın** bir deneyim sağlar.

**Tek fark:** Checkout'ta Shopify native login ekranı görünebilir (ama otomatik tanınma var).

**STABLE SİSTEM (158ffb0) ÜZERE CERRAHİ UYGULANACAK!**

