import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import { JwtUser } from "./jwt-user.interface";

@Injectable()
export class PlatformOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;

    if (!user) {
      throw new ForbiddenException(
        "Utente autenticato non disponibile",
      );
    }

    if (user.platformRole !== "PLATFORM_OWNER") {
      throw new ForbiddenException(
        "Accesso riservato al Platform Owner",
      );
    }

    return true;
  }
}