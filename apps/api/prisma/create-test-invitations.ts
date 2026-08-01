import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const associationId = "assoc_demo_001";
const invitedById = "cms7do5la0002ttdomff1x4gs";

const invitations = [
  {
    email: "giulia.rossi@example.com",
    role: "MEMBER",
  },
  {
    email: "marco.bianchi@example.com",
    role: "MEMBER",
  },
  {
    email: "sara.conti@example.com",
    role: "ADMIN",
  },
  {
    email: "luca.romano@example.com",
    role: "MEMBER",
  },
  {
    email: "elena.ferrari@example.com",
    role: "MEMBER",
  },
] as const;

async function main() {
  const association = await prisma.association.findUnique({
    where: {
      id: associationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!association) {
    throw new Error(
      `Associazione ${associationId} non trovata`,
    );
  }

  const inviter = await prisma.user.findUnique({
    where: {
      id: invitedById,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!inviter) {
    throw new Error(
      `Utente invitante ${invitedById} non trovato`,
    );
  }

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  for (const invitation of invitations) {
    await prisma.invitation.deleteMany({
      where: {
        associationId,
        email: invitation.email,
      },
    });

    const created = await prisma.invitation.create({
      data: {
        associationId,
        invitedById,
        email: invitation.email,
        role: invitation.role,
        token: randomUUID(),
        expiresAt,
      },
    });

    console.log(
      `Creato invito: ${created.email} — ${created.role}`,
    );
  }

  console.log(
    `\nCreati ${invitations.length} inviti per ${association.name}.`,
  );
}

main()
  .catch((error) => {
    console.error("Errore creazione inviti:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });