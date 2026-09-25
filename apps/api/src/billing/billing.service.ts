import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type UpdateSubscriptionData = {
  subscriptionStatus?: string | null;
  subscriptionCurrentPeriodEnd?: Date | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  plan?: SubscriptionPlan;
  currentPeriodStart?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
};

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Salva lo Stripe Customer ID sia sull'associazione
   * sia sulla relativa Subscription.
   */
  async attachCustomer(
    associationId: string,
    stripeCustomerId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const association =
        await tx.association.update({
          where: {
            id: associationId,
          },
          data: {
            stripeCustomerId,
          },
        });

      await tx.subscription.upsert({
        where: {
          associationId,
        },
        create: {
          associationId,
          plan: "FREE",
          status: "ACTIVE",
          stripeCustomerId,
        },
        update: {
          stripeCustomerId,
        },
      });

      return association;
    });
  }

  /**
   * Aggiorna la sottoscrizione.
   *
   * Manteniamo anche i vecchi campi su Association
   * per compatibilità con il codice già esistente.
   */
  async updateSubscription(
    associationId: string,
    data: UpdateSubscriptionData,
  ) {
    const association =
      await this.prisma.association.findUnique({
        where: {
          id: associationId,
        },
      });

    if (!association) {
      throw new NotFoundException(
        "Associazione non trovata",
      );
    }

    const {
      subscriptionStatus,
      subscriptionCurrentPeriodEnd,
      stripeSubscriptionId,
      stripePriceId,
      plan,
      currentPeriodStart,
      cancelAtPeriodEnd,
      canceledAt,
    } = data;

    const mappedStatus =
      this.mapStripeStatus(subscriptionStatus);

    return this.prisma.$transaction(
      async (tx) => {
        const updatedAssociation =
          await tx.association.update({
            where: {
              id: associationId,
            },
            data: {
              ...(subscriptionStatus !== undefined && {
                subscriptionStatus,
              }),
              ...(subscriptionCurrentPeriodEnd !==
                undefined && {
                subscriptionCurrentPeriodEnd,
              }),
              ...(stripeSubscriptionId !==
                undefined && {
                stripeSubscriptionId,
              }),
            },
          });

        await tx.subscription.upsert({
          where: {
            associationId,
          },
          create: {
            associationId,
            plan:
              plan ??
              this.inferPlanFromPricePublic(
                stripePriceId,
              ),
            status:
              mappedStatus ??
              SubscriptionStatus.ACTIVE,
            stripeCustomerId:
              association.stripeCustomerId,
            stripeSubscriptionId:
              stripeSubscriptionId ?? null,
            stripePriceId:
              stripePriceId ?? null,
            currentPeriodStart:
              currentPeriodStart ?? null,
            currentPeriodEnd:
              subscriptionCurrentPeriodEnd ??
              null,
            cancelAtPeriodEnd:
              cancelAtPeriodEnd ?? false,
            canceledAt:
              canceledAt ?? null,
          },
          update: {
            ...(plan !== undefined && {
              plan,
            }),
            ...(mappedStatus !== null && {
              status: mappedStatus,
            }),
            ...(stripeSubscriptionId !==
              undefined && {
              stripeSubscriptionId,
            }),
            ...(stripePriceId !== undefined && {
              stripePriceId,
            }),
            ...(currentPeriodStart !==
              undefined && {
              currentPeriodStart,
            }),
            ...(subscriptionCurrentPeriodEnd !==
              undefined && {
              currentPeriodEnd:
                subscriptionCurrentPeriodEnd,
            }),
            ...(cancelAtPeriodEnd !==
              undefined && {
              cancelAtPeriodEnd,
            }),
            ...(canceledAt !== undefined && {
              canceledAt,
            }),
            ...(association.stripeCustomerId && {
              stripeCustomerId:
                association.stripeCustomerId,
            }),
          },
        });

        return updatedAssociation;
      },
    );
  }

  /**
   * Trova associazione tramite Stripe Customer ID.
   */
  async findByCustomerId(customerId: string) {
    const association =
      await this.prisma.association.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      });

    if (!association) {
      throw new NotFoundException(
        "Associazione non trovata per questo customerId",
      );
    }

    return association;
  }

  /**
   * Recupera l'abbonamento dell'associazione.
   */
  async getSubscription(
    associationId: string,
  ) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          associationId,
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        "Abbonamento non trovato",
      );
    }

    return subscription;
  }

  /**
   * Converte lo stato Stripe nello stato interno.
   */
  private mapStripeStatus(
    status?: string | null,
  ): SubscriptionStatus | null {
    if (!status) {
      return null;
    }

    const allowedStatuses: Record<
      string,
      SubscriptionStatus
    > = {
      incomplete:
        SubscriptionStatus.INCOMPLETE,
      incomplete_expired:
        SubscriptionStatus.INCOMPLETE_EXPIRED,
      trialing:
        SubscriptionStatus.TRIALING,
      active:
        SubscriptionStatus.ACTIVE,
      past_due:
        SubscriptionStatus.PAST_DUE,
      canceled:
        SubscriptionStatus.CANCELED,
      unpaid:
        SubscriptionStatus.UNPAID,
      paused:
        SubscriptionStatus.PAUSED,
    };

    return allowedStatuses[status] ?? null;
  }

  /**
   * Determina il piano dal Price ID configurato.
   *
   * Per ora il progetto dispone di un solo
   * STRIPE_PRICE_ID. Lo trattiamo come PRO.
   *
   * Quando configureremo BASIC/PRO separatamente,
   * questa funzione verrà estesa senza modificare
   * la struttura del database.
   */
  inferPlanFromPricePublic(
    stripePriceId?: string | null,
  ): SubscriptionPlan {
    if (!stripePriceId) {
      return SubscriptionPlan.FREE;
    }

    const configuredPrice =
      process.env.STRIPE_PRICE_ID?.trim();

    if (
      configuredPrice &&
      stripePriceId === configuredPrice
    ) {
      return SubscriptionPlan.PRO;
    }

    return SubscriptionPlan.FREE;
  }
}


