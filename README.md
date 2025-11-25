# 🦅 Eagle B2B Commerce Engine

**Transform Shopify stores into powerful B2B platforms**

Eagle B2B Commerce Engine is a comprehensive SaaS solution that brings enterprise-grade B2B functionality to Shopify stores. Enable custom pricing, company account management, team collaboration, approval workflows, and advanced analytics.

---

## 🌟 Features

### For Merchants (Admin Panel)
- **Company Management**: Convert Shopify customers into B2B companies
- **Custom Pricing Engine**: Define complex pricing rules (percentage, fixed, quantity breaks)
- **Advanced Analytics**: Track customer behavior, product performance, and conversion funnels
- **Shopify Sync**: Automatic synchronization of customers, products, and orders
- **Flexible Rules**: Target by company, group, product, collection, or tags

### For B2B Customers (Company Portal)
- **Company Accounts**: Manage team members with role-based access
- **Custom Pricing**: View exclusive B2B prices and discounts
- **Shared Carts**: Collaborate on purchases with approval workflows
- **Order History**: Track all company orders in one place
- **Quote Requests**: Request custom quotes for bulk orders

### Technical Highlights
- **Seamless Integration**: Smart snippet integrates with any Shopify theme
- **Real-time Sync**: 20-second interval syncing with Shopify
- **Event Tracking**: Comprehensive analytics on customer behavior
- **Discount Engine**: Automatic price adjustments at Shopify checkout
- **Scalable Architecture**: Built for high-performance and reliability

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js 20+ | NestJS | TypeScript | PostgreSQL | Redis
- **Admin Panel**: React | Next.js 14 (App Router) | TailwindCSS | shadcn/ui
- **Company Portal**: React | Next.js 14 (App Router) | TailwindCSS
- **Snippet**: Vanilla TypeScript | Vite
- **Infrastructure**: Caddy | PM2 | Ubuntu | Hetzner Cloud

### Domains
- **Admin Panel**: `app.eagledtfsupply.com`
- **Company Portal**: `accounts.eagledtfsupply.com`
- **Backend API**: `api.eagledtfsupply.com`
- **CDN**: `cdn.eagledtfsupply.com`

---

## 📁 Project Structure

```
eagle-engine.dev/
├── backend/              # NestJS backend API
├── admin/                # Admin panel (Next.js)
├── accounts/             # Company portal (Next.js)
├── snippet/              # Shopify snippet (TypeScript)
├── docs/                 # Documentation
├── .github/              # CI/CD workflows
└── PROJECT_MASTER_PLAN.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- npm or pnpm

### Installation

```bash
# Clone repository
git clone git@github.com:jesuisfatih/eagle-engine.dev.git
cd eagle-engine.dev

# Install dependencies (each module)
cd backend && npm install
cd ../admin && npm install
cd ../accounts && npm install
cd ../snippet && npm install

# Setup environment
cp backend/.env.example backend/.env
# Edit .env with your credentials

# Run database migrations
cd backend
npx prisma migrate dev

# Start development servers
npm run dev  # In each module
```

---

## 📊 Database Schema

See [PROJECT_MASTER_PLAN.md](./PROJECT_MASTER_PLAN.md) for complete database schema, relationships, and entity diagrams.

**Key Tables:**
- `merchants` - Shopify store owners
- `companies` - B2B companies
- `company_users` - Team members with roles
- `shopify_customers` - Synced Shopify customers
- `catalog_products/variants` - Product catalog
- `pricing_rules` - Custom pricing logic
- `carts/cart_items` - Eagle cart system
- `orders_local` - Order history with company mapping
- `activity_log` - Event tracking & analytics

---

## 🔄 Data Flow

### 1. Shopify Sync
```
Shopify API → Sync Workers (BullMQ) → PostgreSQL
```

### 2. Event Tracking
```
Snippet → Event Queue → Event Processor → activity_log
```

### 3. Pricing Flow
```
Product Request → Pricing Engine → Apply Rules → Return Price
```

### 4. Checkout Flow
```
Eagle Cart → Discount Engine → Shopify Checkout → Order Webhook → orders_local
```

---

## 🛠️ Development Roadmap

See [PROJECT_MASTER_PLAN.md](./PROJECT_MASTER_PLAN.md) for the complete 40-day development plan.

**Current Phase**: Infrastructure Setup ✅

---

## 🚢 Deployment

### Server
- **Provider**: Hetzner Cloud
- **OS**: Ubuntu 22.04 LTS
- **IP**: 5.78.148.183
- **SSH**: `ssh root@5.78.148.183 -i ~/.ssh/hetzner_gsb`

### CI/CD
Automated deployment via GitHub Actions on push to `main` branch.

```bash
# Manual deployment
ssh root@5.78.148.183 -i ~/.ssh/hetzner_gsb
cd /var/www/eagle
git pull
npm run deploy
```

---

## 📖 Documentation

- [Master Plan](./PROJECT_MASTER_PLAN.md) - Complete technical specification
- [API Documentation](./docs/api.md) - API endpoints reference
- [Admin Guide](./docs/admin-guide.md) - Admin panel user guide
- [Company Guide](./docs/company-guide.md) - Company portal user guide
- [Developer Guide](./docs/developer-guide.md) - Integration & customization

---

## 🔒 Security

- JWT authentication with refresh tokens
- Shopify OAuth 2.0
- Webhook signature verification
- Input validation & sanitization
- Rate limiting
- SQL injection prevention (Prisma ORM)
- XSS & CSRF protection

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📈 Performance

- API response time: < 200ms (p95)
- Event processing: < 5s (p95)
- Database queries: < 50ms (avg)
- Uptime: > 99.9%

---

## 🤝 Contributing

This is a private project. For collaboration opportunities, please contact the maintainer.

---

## 📝 License

Proprietary - All rights reserved

---

## 👨‍💻 Maintainer

**Developer**: jesuisfatih  
**Repository**: [git@github.com:jesuisfatih/eagle-engine.dev.git](git@github.com:jesuisfatih/eagle-engine.dev.git)

---

## 🙏 Acknowledgments

Built with modern best practices and cutting-edge technologies to deliver a world-class B2B experience for Shopify merchants.

---

**🦅 Let's soar with Eagle!**

