import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtUser, MembershipRole } from './.types/jwt-user.type';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser;
    const associationId = request.headers['x-association-id'];

    if (!user || !Array.isArray(user.memberships)) {
      throw new ForbiddenException('No memberships found');
    }

    if (!associationId || typeof associationId !== 'string') {
      throw new ForbiddenException('Association id is required');
    }

    const membership = user.memberships.find(
      (m) => m.associationId === associationId,
    );

    if (!membership) {
      throw new ForbiddenException('Membership not found for association');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}