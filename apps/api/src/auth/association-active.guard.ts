import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssociationActiveGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.associationId) {
      return true;
    }

    const association = await this.prisma.association.findUnique({
      where: {
        id: user.associationId,
      },
      select: {
        isActive: true,
      },
    });

    if (!association) {
      throw new ForbiddenException('Association not found');
    }

    if (!association.isActive) {
      throw new ForbiddenException('Association is inactive');
    }

    return true;
  }
}