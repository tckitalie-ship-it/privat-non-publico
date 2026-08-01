import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding admin...");

  const email = "admin@example.com";
  const password = "admin123";
  const hashed = await bcrypt.hash(password, 10);

  // 1) Crea l'utente admin
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashed, // 👈 CORRETTO
    },
  });

  console.log("👤 Admin creato:", user.email);

  // 2) Crea un'associazione
  const association = await prisma.association.create({
    data: {
      name: "Associazione Principale",
      description: "Associazione di default",
      isActive: true,
    },
  });

  console.log("🏛 Associazione:", association.name);

  // 3) Crea membership admin
  await prisma.membership.create({
    data: {
      userId: user.id,
      associationId: association.id,
      role: "ADMIN",
    },
  });

  console.log("🔑 Membership admin creata");
}

main()
  .then(() => {
    console.log("🌱 Seed completato!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
