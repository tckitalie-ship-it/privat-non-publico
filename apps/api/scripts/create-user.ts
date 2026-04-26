import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = '123456';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
    },
  });

  console.log('User pronto:', {
    id: user.id,
    email: user.email,
    password,
  });
}

main()
  .catch((e) => {
    console.error('Errore:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });