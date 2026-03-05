// Demo seed — creates a demo user + sample project for public demo
// Run: node prisma/seed.js
// Or add to package.json: "prisma": { "seed": "node prisma/seed.js" }

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@contentpilot.app';
  const password = 'Demo1234!';

  // Upsert demo user
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: 'Demo User',
      locale: 'ar',
      subscriptionPlan: 'Pro',
      subscriptionStatus: 'active',
    },
  });

  console.log(`Demo user: ${user.email}  password: ${password}`);

  // Upsert a sample project
  const existing = await prisma.project.findFirst({ where: { userId: user.id, name: 'مطعم الأصالة' } });
  if (!existing) {
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'مطعم الأصالة',
        country: 'Tunisia',
        field: 'Food & Beverage',
        description: 'مطعم تونسي أصيل يقدم أشهى المأكولات التقليدية في قلب المدينة',
        strengths: JSON.stringify(['جودة المكونات', 'وصفات عائلية أصيلة', 'تجربة مميزة']),
        theme: 'bold',
        brandColors: JSON.stringify({ primary: '#C0392B', secondary: '#F39C12' }),
      },
    });
    console.log(`Demo project created: ${project.name} (id: ${project.id})`);
  } else {
    console.log(`Demo project already exists: ${existing.name}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
