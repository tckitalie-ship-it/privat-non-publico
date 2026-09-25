const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const associations = await prisma.association.findMany({
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const existing = await prisma.subscription.findMany({
    select: {
      associationId: true,
    },
  });

  const existingIds = new Set(
    existing.map((item) => item.associationId),
  );

  let created = 0;
  let skipped = 0;

  for (const association of associations) {
    if (existingIds.has(association.id)) {
      skipped++;
      continue;
    }

    await prisma.subscription.create({
      data: {
        associationId: association.id,
        plan: "FREE",
        status: "ACTIVE",
      },
    });

    created++;

    console.log(
      `CREATA: ${association.name} -> FREE`,
    );
  }

  console.log("");
  console.log(`Associazioni totali: ${associations.length}`);
  console.log(`Subscription già presenti: ${skipped}`);
  console.log(`Subscription create: ${created}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
