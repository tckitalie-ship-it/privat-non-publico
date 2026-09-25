const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.user.findMany({
  where: {
    email: {
      endsWith: "@npa.test",
    },
  },
  select: {
    email: true,
    failedAttempts: true,
    lockUntil: true,
  },
}).then((users) => {
  console.log(JSON.stringify(users, null, 2));
}).finally(() => prisma.$disconnect());
