import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventRegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un utente a un evento
   */
  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Evento non trovato");
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId: event.associationId },
    });

    if (!membership) {
      throw new ForbiddenException("Non sei membro di questa associazione");
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("Sei già registrato a questo evento");
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    });
  }

  /**
   * Restituisce tutte le registrazioni di un evento
   */
  async list(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Evento non trovato");
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId: event.associationId },
    });

    if (!membership) {
      throw new ForbiddenException("Non sei membro di questa associazione");
    }

    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: true,
      },
    });
  }

  /**
   * Rimuove una registrazione
   */
  async unregister(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException("Registrazione non trovata");
    }

    await this.prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return { message: "Registrazione rimossa" };
  }
}
