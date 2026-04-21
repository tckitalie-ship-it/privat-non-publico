import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL mancante nel file .env');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'test@example.com';
  const password = '123456';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log('User pronto:', {
    id: user.id,
    email: user.email,
    password: user.password,
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