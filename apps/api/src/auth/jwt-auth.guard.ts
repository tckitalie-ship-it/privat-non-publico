import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtUser } from "./jwt-user.interface";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  /**
   * Firma corretta del metodo handleRequest
   * (deve includere context e status)
   */
  handleRequest<TUser = JwtUser>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any
  ): TUser {
    if (err) {
      throw new UnauthorizedException("Errore autenticazione JWT");
    }

    if (!user) {
      throw new UnauthorizedException("Token JWT mancante o non valido");
    }

    return user as TUser;
  }

  /**
   * Logging intelligente + controllo header Authorization
   */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Authorization header mancante");
    }

    return super.canActivate(context);
  }
}
