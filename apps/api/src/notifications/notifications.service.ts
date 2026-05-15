import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    title: string;
    message: string;
    associationId: string;
    userId?: string | null;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        title: params.title,
        message: params.message,
        associationId: params.associationId,
        userId: params.userId || null,
      },
    });

    console.log('NOTIFICATION CREATED:', notification);

    NotificationsGateway.emitNotification(notification);

    return notification;
  }

  async findAll(user: any) {
    if (!user.associationId) {
      return [];
    }

    return this.prisma.notification.findMany({
      where: {
        associationId: user.associationId,
        OR: [{ userId: user.id }, { userId: null }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });
  }

  async markAsRead(user: any, id: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        associationId: user.associationId,
        OR: [{ userId: user.id }, { userId: null }],
      },
      data: {
        read: true,
      },
    });
  }
}