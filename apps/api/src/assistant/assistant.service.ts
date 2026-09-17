import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

@Injectable()
export class AssistantService {
  constructor(private readonly prisma: PrismaService) {}

  async ask(
    message: string,
    history: ChatMessage[] = [],
    userId?: string,
    associationId?: string,
  ) {
    const cleanMessage = message?.trim();

    if (!cleanMessage) {
      throw new Error("Il messaggio non può essere vuoto.");
    }

    const normalizedMessage = cleanMessage
      .toLowerCase()
      .replace(/[!?.,;:]/g, "")
      .trim();

    /*
     * SALUTI
     */
    if (
      normalizedMessage === "ciao" ||
      normalizedMessage === "salve" ||
      normalizedMessage === "buongiorno" ||
      normalizedMessage === "buonasera"
    ) {
      return {
        answer:
          "Ciao! 👋 Sono l'assistente di Privat Non Publico. Come posso aiutarti?",
      };
    }

    /*
     * GRAZIE
     */
    if (
      normalizedMessage === "grazie" ||
      normalizedMessage === "grazie mille"
    ) {
      return {
        answer: "Di nulla! 😊",
      };
    }

    let context = "";

    if (userId) {
      /*
       * Recuperiamo le associazioni dell'utente.
       */
      const memberships = await this.prisma.membership.findMany({
        where: {
          userId,
        },
        select: {
          associationId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (memberships.length === 0) {
        throw new ForbiddenException(
          "Non appartieni a nessuna associazione.",
        );
      }

      /*
       * Se arriva associationId dal frontend:
       * usiamo esclusivamente quella associazione,
       * verificando prima che l'utente ne faccia parte.
       *
       * Altrimenti usiamo la prima associazione disponibile.
       */
      let activeAssociationId = associationId?.trim();

      if (activeAssociationId) {
        const isMember = memberships.some(
          (membership) =>
            membership.associationId === activeAssociationId,
        );

        if (!isMember) {
          throw new ForbiddenException(
            "Non hai accesso a questa associazione.",
          );
        }
      } else {
        activeAssociationId =
          memberships[0].associationId;
      }

      const now = new Date();

      const formatEuroFast = (cents: number) =>
        new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(cents / 100);

      /*
       * =====================================================
       * FAST PATH
       * =====================================================
       * Le richieste strutturate vengono risposte direttamente
       * da Prisma, senza caricare tutto il database e senza
       * passare da Ollama.
       */

      const expenseCountFast = normalizedMessage.match(
        /(?:ultime|ultimi)\s+(\d+)\s+(?:spese|uscite)\b/,
      );
      const incomeCountFast = normalizedMessage.match(
        /(?:ultime|ultimi)\s+(\d+)\s+(?:entrate|incassi)\b/,
      );
      const eventCountFast = normalizedMessage.match(
        /(?:prossimi|ultimi|ultime)\s+(\d+)\s+eventi?\b/,
      );

      const asksIncomeTotalFast =
        normalizedMessage.includes("quanto abbiamo incassato") ||
        normalizedMessage.includes("quanto abbiamo incassato") ||
        normalizedMessage.includes("totale entrate") ||
        normalizedMessage.includes("totale incassi");

      const asksExpenseTotalFast =
        normalizedMessage.includes("quanto abbiamo speso") ||
        normalizedMessage.includes("totale spese") ||
        normalizedMessage.includes("totale uscite");

      const asksBalanceFast =
        normalizedMessage === "qual è il saldo" ||
        normalizedMessage === "qual e il saldo" ||
        normalizedMessage.includes("qual è il saldo") ||
        normalizedMessage.includes("qual e il saldo");

      if (expenseCountFast) {
        const count = Math.min(Math.max(Number(expenseCountFast[1]), 1), 50);
        const rows = await this.prisma.transaction.findMany({
          where: {
            associationId: activeAssociationId,
            type: "EXPENSE",
          },
          select: {
            title: true,
            description: true,
            amountCents: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: count,
        });

        if (rows.length === 0) {
          return { answer: "Non risultano ancora spese registrate." };
        }

        const list = rows.map((row) => {
          const label = row.title || row.description || "Movimento finanziario";
          const date = new Intl.DateTimeFormat("it-IT").format(new Date(row.date));
          return `- ${date} — ${label} — ${formatEuroFast(row.amountCents)}`;
        }).join("\n");

        if (rows.length < count) {
          return { answer: `Ho trovato ${rows.length} spese, invece delle ${count} richieste:\n${list}` };
        }
        return { answer: `Ecco le ultime ${rows.length} spese:\n${list}` };
      }

      if (incomeCountFast) {
        const count = Math.min(Math.max(Number(incomeCountFast[1]), 1), 50);
        const rows = await this.prisma.transaction.findMany({
          where: {
            associationId: activeAssociationId,
            type: "INCOME",
          },
          select: {
            title: true,
            description: true,
            amountCents: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: count,
        });

        if (rows.length === 0) {
          return { answer: "Non risultano ancora entrate registrate." };
        }

        const list = rows.map((row) => {
          const label = row.title || row.description || "Movimento finanziario";
          const date = new Intl.DateTimeFormat("it-IT").format(new Date(row.date));
          return `- ${date} — ${label} — ${formatEuroFast(row.amountCents)}`;
        }).join("\n");

        if (rows.length < count) {
          return { answer: `Ho trovato ${rows.length} entrate, invece delle ${count} richieste:\n${list}` };
        }
        return { answer: `Ecco le ultime ${rows.length} entrate:\n${list}` };
      }

      if (eventCountFast) {
        const count = Math.min(Math.max(Number(eventCountFast[1]), 1), 50);
        const rows = await this.prisma.event.findMany({
          where: {
            associationId: activeAssociationId,
            startsAt: { gte: now },
          },
          select: { title: true, startsAt: true, location: true },
          orderBy: { startsAt: "asc" },
          take: count,
        });

        if (rows.length === 0) {
          return { answer: "Non risultano eventi futuri in programma." };
        }

        const list = rows.map((row) => {
          const date = new Intl.DateTimeFormat("it-IT", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(row.startsAt));
          return `- ${row.title} | ${date}${row.location ? ` | ${row.location}` : ""}`;
        }).join("\n");

        if (rows.length < count) {
          return { answer: `Ho trovato ${rows.length} eventi, invece dei ${count} richiesti:\n${list}` };
        }
        return { answer: `Ecco i prossimi ${rows.length} eventi:\n${list}` };
      }

      if (asksIncomeTotalFast || asksExpenseTotalFast || asksBalanceFast) {
        const [income, expense] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: { associationId: activeAssociationId, type: "INCOME" },
            _sum: { amountCents: true },
          }),
          this.prisma.transaction.aggregate({
            where: { associationId: activeAssociationId, type: "EXPENSE" },
            _sum: { amountCents: true },
          }),
        ]);

        const incomeCents = income._sum.amountCents ?? 0;
        const expenseCents = expense._sum.amountCents ?? 0;

        if (asksBalanceFast) {
          return { answer: `Il saldo attuale è di ${formatEuroFast(incomeCents - expenseCents)}.` };
        }
        if (asksExpenseTotalFast) {
          return { answer: `Abbiamo speso complessivamente ${formatEuroFast(expenseCents)}.` };
        }
        return { answer: `Abbiamo incassato complessivamente ${formatEuroFast(incomeCents)}.` };
      }

      const [
        members,
        events,
        transactions,
      ] = await Promise.all([
        /*
         * MEMBRI
         */
        this.prisma.membership.findMany({
          where: {
            associationId: activeAssociationId,
          },
          select: {
            id: true,
            userId: true,
            associationId: true,
            role: true,
            memberNumber: true,
          },
          orderBy: {
            memberNumber: "asc",
          },
        }),

        /*
         * EVENTI FUTURI
         */
        this.prisma.event.findMany({
          where: {
            associationId: activeAssociationId,
            startsAt: {
              gte: now,
            },
          },
          select: {
            id: true,
            title: true,
            startsAt: true,
            endsAt: true,
            location: true,
            associationId: true,
            association: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            startsAt: "asc",
          },
          take: 20,
        }),

        /*
         * TRANSAZIONI
         *
         * Non limitiamo a 50:
         * l'Assistant deve poter cercare
         * tutte le entrate e tutte le spese.
         */
        this.prisma.transaction.findMany({
          where: {
            associationId: activeAssociationId,
          },
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            category: true,
            amountCents: true,
            date: true,
            associationId: true,
          },
          orderBy: {
            date: "desc",
          },
        }),
      ]);

      /*
       * CONTEGGIO RUOLI
       */
      const roleCounts: Record<string, number> = {};

      for (const member of members) {
        roleCounts[member.role] =
          (roleCounts[member.role] || 0) + 1;
      }

      /*
       * TOTALI FINANZIARI
       */
      const totalIncomeCents = transactions
        .filter(
          (transaction) =>
            transaction.type === "INCOME",
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amountCents,
          0,
        );

      const totalExpenseCents = transactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE",
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amountCents,
          0,
        );

      const balanceCents =
        totalIncomeCents -
        totalExpenseCents;

      const formatEuro = (cents: number) =>
        new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(cents / 100);

      /*
       * SPESA PIÙ ALTA
       */
      const highestExpense = transactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE",
        )
        .sort(
          (a, b) =>
            b.amountCents - a.amountCents,
        )[0];

      /*
       * =====================================================
       * ULTIME N SPESE
       * =====================================================
       */

      const expenseCountMatch =
        normalizedMessage.match(
          /(?:ultime|ultimi)\s+(\d+)\s+(?:spese|uscite)\b/,
        );

      const requestedExpenseCount =
        expenseCountMatch
          ? Math.min(
              Math.max(
                Number(
                  expenseCountMatch[1],
                ),
                1,
              ),
              50,
            )
          : null;

      const asksRecentExpenses =
        normalizedMessage.includes(
          "ultime spese",
        ) ||
        normalizedMessage.includes(
          "ultimi movimenti di spesa",
        ) ||
        normalizedMessage.includes(
          "ultime uscite",
        ) ||
        requestedExpenseCount !== null;

      /*
       * =====================================================
       * ULTIME N ENTRATE
       * =====================================================
       */

      const incomeCountMatch =
        normalizedMessage.match(
          /(?:ultime|ultimi)\s+(\d+)\s+(?:entrate|incassi)\b/,
        );

      const requestedIncomeCount =
        incomeCountMatch
          ? Math.min(
              Math.max(
                Number(
                  incomeCountMatch[1],
                ),
                1,
              ),
              50,
            )
          : null;

      const asksRecentIncome =
        normalizedMessage.includes(
          "ultime entrate",
        ) ||
        normalizedMessage.includes(
          "ultimi incassi",
        ) ||
        normalizedMessage.includes(
          "ultimi movimenti di entrata",
        ) ||
        requestedIncomeCount !== null;

      /*
       * =====================================================
       * CATEGORIA
       * =====================================================
       *
       * Evitiamo di interpretare:
       * "ultime 3 spese"
       * "ultime 5 entrate"
       * come categorie.
       */
      let requestedCategory:
        | string
        | undefined;

      if (
        requestedExpenseCount === null &&
        requestedIncomeCount === null
      ) {
        const categoryMatch =
          normalizedMessage.match(
            /(?:per|categoria|dalle|dagli|dai|da)\s+(.+)$/,
          );

        requestedCategory =
          categoryMatch?.[1]
            ?.trim()
            .replace(/^la\s+/, "")
            .replace(/^il\s+/, "")
            .replace(/^le\s+/, "")
            .replace(/^i\s+/, "")
            .replace(/^gli\s+/, "")
            .replace(/^un\s+/, "")
            .replace(/^una\s+/, "")
            .trim();
      }

      const categoryTransactions =
        requestedCategory
          ? transactions.filter(
              (transaction) => {
                const search =
                  requestedCategory!.toLowerCase();

                const category =
                  transaction.category
                    ?.toLowerCase()
                    .trim();

                const title =
                  transaction.title
                    ?.toLowerCase()
                    .trim();

                const description =
                  transaction.description
                    ?.toLowerCase()
                    .trim();

                return (
                  category?.includes(search) ||
                  title?.includes(search) ||
                  description?.includes(search)
                );
              },
            )
          : [];

      /*
       * =====================================================
       * MEMBRI
       * =====================================================
       */

      if (
        normalizedMessage.includes(
          "quanti membri",
        ) ||
        normalizedMessage.includes(
          "numero di membri",
        ) ||
        normalizedMessage.includes(
          "totale membri",
        )
      ) {
        return {
          answer: `Nella tua associazione ci sono ${members.length} membri.`,
        };
      }

      if (
        normalizedMessage.includes(
          "membri per ruolo",
        ) ||
        normalizedMessage.includes(
          "quanti membri per ruolo",
        ) ||
        normalizedMessage.includes(
          "ruoli dei membri",
        )
      ) {
        const roles =
          Object.entries(roleCounts)
            .map(
              ([role, count]) =>
                `- ${role}: ${count}`,
            )
            .join("\n");

        return {
          answer:
            `Il numero di membri per ruolo è:\n${roles}`,
        };
      }

      /*
       * =====================================================
       * EVENTI FUTURI
       * =====================================================
       */

      const eventCountMatch =
        normalizedMessage.match(
          /(?:ultimi|ultime)\s+(\d+)\s+eventi?\b/,
        );

      const requestedEventCount =
        eventCountMatch
          ? Math.min(
              Math.max(
                Number(eventCountMatch[1]),
                1,
              ),
              50,
            )
          : null;

      const asksUpcomingEvents =
        normalizedMessage.includes(
          "prossimi eventi",
        ) ||
        normalizedMessage.includes(
          "prossimi appuntamenti",
        ) ||
        normalizedMessage.includes(
          "eventi futuri",
        ) ||
        normalizedMessage.includes(
          "eventi in programma",
        ) ||
        normalizedMessage.includes(
          "quando è il prossimo evento",
        ) ||
        normalizedMessage.includes(
          "quando e il prossimo evento",
        ) ||
        requestedEventCount !== null;

      if (asksUpcomingEvents) {
        if (events.length === 0) {
          return {
            answer:
              "Non risultano eventi futuri in programma.",
          };
        }

        const count =
          requestedEventCount ??
          Math.min(events.length, 10);

        const selectedEvents =
          events.slice(0, count);

        const upcomingEvents =
          selectedEvents
            .map((event) => {
              const date =
                new Intl.DateTimeFormat(
                  "it-IT",
                  {
                    dateStyle: "short",
                    timeStyle: "short",
                  },
                ).format(
                  new Date(event.startsAt),
                );

              const location =
                event.location ||
                "luogo non specificato";

              return `- ${date} — ${event.title} — ${location}`;
            })
            .join("\n");

        if (selectedEvents.length === 1) {
          return {
            answer:
              `Ecco il prossimo evento:\n${upcomingEvents}`,
          };
        }

        if (
          requestedEventCount !== null &&
          selectedEvents.length <
            requestedEventCount
        ) {
          return {
            answer:
              `Ho trovato ${selectedEvents.length} eventi, invece dei ${requestedEventCount} richiesti:\n${upcomingEvents}`,
          };
        }

        return {
          answer:
            `Ecco i prossimi ${selectedEvents.length} eventi:\n${upcomingEvents}`,
        };
      }

      /*
       * =====================================================
       * FINANZE
       * =====================================================
       */

      const asksExpense =
        normalizedMessage.includes(
          "quanto abbiamo speso",
        ) ||
        normalizedMessage.includes(
          "totale spese",
        ) ||
        normalizedMessage.includes(
          "totale delle spese",
        ) ||
        normalizedMessage.includes(
          "spese totali",
        ) ||
        normalizedMessage.includes(
          "quanto sono le spese",
        );

      const asksIncome =
        normalizedMessage.includes(
          "quanto abbiamo incassato",
        ) ||
        normalizedMessage.includes(
          "quanto abbiamo guadagnato",
        ) ||
        normalizedMessage.includes(
          "totale entrate",
        ) ||
        normalizedMessage.includes(
          "entrate totali",
        ) ||
        normalizedMessage.includes(
          "totale incassi",
        );

      const asksBalance =
        normalizedMessage.includes(
          "qual è il saldo",
        ) ||
        normalizedMessage.includes(
          "qual e il saldo",
        ) ||
        normalizedMessage.includes(
          "saldo attuale",
        ) ||
        normalizedMessage === "saldo";

      const asksFinancialSummary =
        normalizedMessage.includes(
          "riepilogo finanziario",
        ) ||
        normalizedMessage.includes(
          "situazione finanziaria",
        ) ||
        normalizedMessage.includes(
          "situazione economica",
        );

      const asksRecentTransactions =
        normalizedMessage.includes(
          "ultime transazioni",
        ) ||
        normalizedMessage.includes(
          "ultimi movimenti",
        ) ||
        normalizedMessage.includes(
          "ultime operazioni",
        );

      const asksHighestExpense =
        normalizedMessage.includes(
          "spesa più alta",
        ) ||
        normalizedMessage.includes(
          "spesa piu alta",
        ) ||
        normalizedMessage.includes(
          "spesa maggiore",
        ) ||
        normalizedMessage.includes(
          "spesa più costosa",
        ) ||
        normalizedMessage.includes(
          "spesa piu costosa",
        );

      const asksCategoryExpense =
        normalizedMessage.includes(
          "quanto abbiamo speso per",
        ) ||
        normalizedMessage.includes(
          "quanto abbiamo speso in",
        ) ||
        normalizedMessage.includes(
          "spese per",
        ) ||
        normalizedMessage.includes(
          "spese in",
        );

      const asksCategoryIncome =
        normalizedMessage.includes(
          "quanto abbiamo incassato dalle",
        ) ||
        normalizedMessage.includes(
          "quanto abbiamo incassato per",
        ) ||
        normalizedMessage.includes(
          "quanto abbiamo incassato da",
        ) ||
        normalizedMessage.includes(
          "entrate da",
        ) ||
        normalizedMessage.includes(
          "incassi da",
        );

      const asksCategoryTransactions =
        normalizedMessage.includes(
          "transazioni per",
        ) ||
        normalizedMessage.includes(
          "transazioni della categoria",
        ) ||
        normalizedMessage.includes(
          "movimenti per",
        );

      /*
       * =====================================================
       * ULTIME SPESE
       * =====================================================
       */

      if (asksRecentExpenses) {
        const expenses = transactions
          .filter(
            (transaction) =>
              transaction.type === "EXPENSE",
          )
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime(),
          );

        if (expenses.length === 0) {
          return {
            answer:
              "Non risultano ancora spese registrate.",
          };
        }

        const count =
          requestedExpenseCount ??
          Math.min(expenses.length, 10);

        const selectedExpenses =
          expenses.slice(0, count);

        const recentExpenses =
          selectedExpenses
            .map((transaction) => {
              const label =
                transaction.title ||
                transaction.description ||
                "Movimento finanziario";

              const amount =
                formatEuro(
                  transaction.amountCents,
                );

              const date =
                new Intl.DateTimeFormat(
                  "it-IT",
                ).format(
                  new Date(
                    transaction.date,
                  ),
                );

              return `- ${date} — ${label} — ${amount}`;
            })
            .join("\n");

        /*
         * Risposta naturale in base al numero
         * effettivamente trovato.
         */
        if (selectedExpenses.length === 1) {
          return {
            answer:
              `Ho trovato 1 sola spesa:\n${recentExpenses}${
                expenses.length === 1
                  ? "\n\nNon risultano altre spese registrate."
                  : ""
              }`,
          };
        }

        if (
          requestedExpenseCount !== null &&
          selectedExpenses.length <
            requestedExpenseCount
        ) {
          return {
            answer:
              `Ho trovato ${selectedExpenses.length} spese, invece delle ${requestedExpenseCount} richieste:\n${recentExpenses}`,
          };
        }

        return {
          answer:
            `Ecco le ultime ${selectedExpenses.length} spese:\n${recentExpenses}`,
        };
      }

      /*
       * =====================================================
       * ULTIME ENTRATE
       * =====================================================
       */

      if (asksRecentIncome) {
        const incomes = transactions
          .filter(
            (transaction) =>
              transaction.type === "INCOME",
          )
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime(),
          );

        if (incomes.length === 0) {
          return {
            answer:
              "Non risultano ancora entrate registrate.",
          };
        }

        const count =
          requestedIncomeCount ??
          Math.min(incomes.length, 10);

        const selectedIncomes =
          incomes.slice(0, count);

        const recentIncomes =
          selectedIncomes
            .map((transaction) => {
              const label =
                transaction.title ||
                transaction.description ||
                "Movimento finanziario";

              const amount =
                formatEuro(
                  transaction.amountCents,
                );

              const date =
                new Intl.DateTimeFormat(
                  "it-IT",
                ).format(
                  new Date(
                    transaction.date,
                  ),
                );

              return `- ${date} — ${label} — ${amount}`;
            })
            .join("\n");

        /*
         * Una sola entrata.
         */
        if (selectedIncomes.length === 1) {
          return {
            answer:
              `Ho trovato 1 sola entrata:\n${recentIncomes}${
                incomes.length === 1
                  ? "\n\nNon risultano altre entrate registrate."
                  : ""
              }`,
          };
        }

        /*
         * Meno entrate rispetto a quelle richieste.
         */
        if (
          requestedIncomeCount !== null &&
          selectedIncomes.length <
            requestedIncomeCount
        ) {
          return {
            answer:
              `Ho trovato ${selectedIncomes.length} entrate, invece delle ${requestedIncomeCount} richieste:\n${recentIncomes}`,
          };
        }

        return {
          answer:
            `Ecco le ultime ${selectedIncomes.length} entrate:\n${recentIncomes}`,
        };
      }

      /*
       * =====================================================
       * SPESA PER CATEGORIA
       * =====================================================
       */

      if (
        asksCategoryExpense &&
        requestedCategory
      ) {
        const expenses =
          categoryTransactions.filter(
            (transaction) =>
              transaction.type ===
              "EXPENSE",
          );

        const totalCategoryExpenseCents =
          expenses.reduce(
            (total, transaction) =>
              total + transaction.amountCents,
            0,
          );

        if (expenses.length === 0) {
          return {
            answer:
              `Non risultano spese per "${requestedCategory}".`,
          };
        }

        return {
          answer:
            `Per "${requestedCategory}" abbiamo speso complessivamente ${formatEuro(
              totalCategoryExpenseCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * ENTRATE PER CATEGORIA
       * =====================================================
       */

      if (
        asksCategoryIncome &&
        requestedCategory
      ) {
        const incomes =
          categoryTransactions.filter(
            (transaction) =>
              transaction.type ===
              "INCOME",
          );

        const totalCategoryIncomeCents =
          incomes.reduce(
            (total, transaction) =>
              total + transaction.amountCents,
            0,
          );

        if (incomes.length === 0) {
          return {
            answer:
              `Non risultano entrate per "${requestedCategory}".`,
          };
        }

        return {
          answer:
            `Dalla categoria "${requestedCategory}" abbiamo incassato complessivamente ${formatEuro(
              totalCategoryIncomeCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * TRANSAZIONI PER CATEGORIA
       * =====================================================
       */

      if (
        asksCategoryTransactions &&
        requestedCategory
      ) {
        if (
          categoryTransactions.length === 0
        ) {
          return {
            answer:
              `Non risultano transazioni per "${requestedCategory}".`,
          };
        }

        const categoryList =
          categoryTransactions
            .slice(0, 10)
            .map((transaction) => {
              const type =
                transaction.type ===
                "EXPENSE"
                  ? "Spesa"
                  : "Entrata";

              const label =
                transaction.title ||
                transaction.description ||
                "Movimento finanziario";

              return `- ${type} — ${label} — ${formatEuro(
                transaction.amountCents,
              )}`;
            })
            .join("\n");

        return {
          answer:
            `Ecco le transazioni per "${requestedCategory}":\n${categoryList}`,
        };
      }

      /*
       * =====================================================
       * SPESA PIÙ ALTA
       * =====================================================
       */

      if (asksHighestExpense) {
        if (!highestExpense) {
          return {
            answer:
              "Non risultano ancora spese registrate.",
          };
        }

        const label =
          highestExpense.title ||
          highestExpense.description ||
          "Movimento finanziario";

        return {
          answer:
            `La spesa più alta è "${label}" di ${formatEuro(
              highestExpense.amountCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * TOTALE SPESE
       * =====================================================
       */

      if (asksExpense) {
        return {
          answer:
            `Abbiamo speso complessivamente ${formatEuro(
              totalExpenseCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * TOTALE ENTRATE
       * =====================================================
       */

      if (asksIncome) {
        return {
          answer:
            `Abbiamo incassato complessivamente ${formatEuro(
              totalIncomeCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * SALDO
       * =====================================================
       */

      if (asksBalance) {
        return {
          answer:
            `Il saldo attuale è di ${formatEuro(
              balanceCents,
            )}.`,
        };
      }

      /*
       * =====================================================
       * RIEPILOGO FINANZIARIO
       * =====================================================
       */

      if (asksFinancialSummary) {
        return {
          answer:
            `Riepilogo finanziario:\n` +
            `- Entrate: ${formatEuro(
              totalIncomeCents,
            )}\n` +
            `- Spese: ${formatEuro(
              totalExpenseCents,
            )}\n` +
            `- Saldo: ${formatEuro(
              balanceCents,
            )}`,
        };
      }

      /*
       * =====================================================
       * ULTIME TRANSAZIONI
       * =====================================================
       */

      if (asksRecentTransactions) {
        if (transactions.length === 0) {
          return {
            answer:
              "Non ci sono ancora transazioni finanziarie registrate.",
          };
        }

        const recent = transactions
          .slice(0, 10)
          .map((transaction) => {
            const amount =
              formatEuro(
                transaction.amountCents,
              );

            const label =
              transaction.title ||
              transaction.description ||
              "Movimento finanziario";

            const type =
              transaction.type ===
              "EXPENSE"
                ? "Spesa"
                : "Entrata";

            const date =
              new Intl.DateTimeFormat(
                "it-IT",
              ).format(
                new Date(
                  transaction.date,
                ),
              );

            return `- ${date} — ${type} — ${label} — ${amount}`;
          })
          .join("\n");

        return {
          answer:
            `Ecco le ultime transazioni:\n${recent}`,
        };
      }

      /*
       * =====================================================
       * CONTESTO PER OLLAMA
       * =====================================================
       */

      context = `
DATI DELL'ASSOCIAZIONE:

MEMBRI:
Totale membri: ${members.length}

Distribuzione per ruolo:
${
  Object.entries(roleCounts)
    .map(
      ([role, count]) =>
        `- ${role}: ${count}`,
    )
    .join("\n") ||
  "Nessun membro."
}

FINANZE:
- Entrate totali: ${formatEuro(
        totalIncomeCents,
      )}
- Spese totali: ${formatEuro(
        totalExpenseCents,
      )}
- Saldo: ${formatEuro(
        balanceCents,
      )}

TRANSAZIONI:
${
  transactions.length === 0
    ? "Nessuna transazione."
    : transactions
        .slice(0, 5)
        .map(
          (transaction) =>
            `- ${
              transaction.type ===
              "EXPENSE"
                ? "Spesa"
                : "Entrata"
            } | ${
              transaction.title ||
              transaction.description ||
              "Movimento finanziario"
            } | ${formatEuro(
              transaction.amountCents,
            )} | ${new Intl.DateTimeFormat(
              "it-IT",
            ).format(
              new Date(
                transaction.date,
              ),
            )}`,
        )
        .join("\n")
}

EVENTI FUTURI:
${
  events.length === 0
    ? "Nessun evento futuro."
    : events
        .slice(0, 5)
        .map(
          (event) =>
            `- ${event.title} | ${event.startsAt.toLocaleString(
              "it-IT",
            )} | ${
              event.location ||
              "luogo non specificato"
            }`,
        )
        .join("\n")
}
`;
    }

    /*
     * =====================================================
     * STORICO CONVERSAZIONE
     * =====================================================
     */

    const recentHistory = history
      .slice(-2)
      .map(
        (item) =>
          `${
            item.role === "user"
              ? "Utente"
              : "Assistente"
          }: ${item.content}`,
      )
      .join("\n");

    /*
     * =====================================================
     * PROMPT OLLAMA
     * =====================================================
     */

    const prompt = `
Sei l'assistente di Privat Non Publico.
Rispondi in italiano, in modo breve e diretto.
Non inventare dati. Usa solo il contesto fornito.

CONTESTO:
${context}

CONVERSAZIONE RECENTE:
${recentHistory}

DOMANDA DELL'UTENTE:
${cleanMessage}
`;

    /*
     * =====================================================
     * OLLAMA
     * =====================================================
     */

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    try {
      const response = await fetch(
        "http://127.0.0.1:11434/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            model:
              process.env.OLLAMA_MODEL ||
              "qwen2.5:3b",
            stream: false,
            messages: [
              {
                role: "system",
                content: prompt,
              },
              {
                role: "user",
                content: cleanMessage,
              },
            ],
            options: {
              temperature: 0.1,
              num_predict: 80,
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Ollama API error:",
          errorText,
        );

        throw new ServiceUnavailableException(
          "Il servizio dell'assistente locale non è disponibile.",
        );
      }

      const data =
        await response.json();

      const answer =
        data?.message?.content?.trim();

      if (!answer) {
        throw new ServiceUnavailableException(
          "L'assistente locale non ha restituito una risposta.",
        );
      }

      return {
        answer,
      };
    } catch (error) {
      if (
        error instanceof
        ServiceUnavailableException
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new ServiceUnavailableException(
          "L'assistente locale ha impiegato troppo tempo a rispondere.",
        );
      }

      console.error(
        "Assistant error:",
        error,
      );

      throw new ServiceUnavailableException(
        "Errore nella comunicazione con l'assistente locale.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}