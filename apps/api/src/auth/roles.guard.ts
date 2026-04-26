import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { MembershipRole } from './.types/jwt-user.type';

type JwtRequestUser = {
  id: string;
  sub: string;
  email: string;
  associationId: string | null;
  role: MembershipRole | null;
};

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
    const user = request.user as JwtRequestUser | undefined;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!user.associationId) {
      throw new ForbiddenException('Association id is required');
    }

    if (!user.role) {
      throw new ForbiddenException('Role is required');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}