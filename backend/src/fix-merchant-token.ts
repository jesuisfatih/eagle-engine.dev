import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!shopifyToken) {
    console.error('❌ SHOPIFY_ACCESS_TOKEN not set in env');
    process.exit(1);
  }

  console.log('🔧 Fixing merchant access token...');
  console.log(`   Shop: ${shopDomain}`);
  console.log(`   Token: ${shopifyToken.substring(0, 10)}...`);

  // Find merchant
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    console.error('❌ No merchant found');
    process.exit(1);
  }

  console.log(`   Current token: ${merchant.accessToken.substring(0, 10)}...`);

  if (merchant.accessToken === shopifyToken) {
    console.log('✅ Token already matches env — no update needed.');
    return;
  }

  // Update the token
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { accessToken: shopifyToken },
  });

  console.log('✅ Merchant access token updated successfully!');
  console.log('🔄 Now reset sync and re-run to pull fresh data.');
}

main()
  .catch((e) => {
    console.error('❌ Fix failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
