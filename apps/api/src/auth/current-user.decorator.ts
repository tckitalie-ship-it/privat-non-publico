import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from './jwt-user.interface';

/**
 * Estrae l'utente autenticato dal request
 * e lo tipizza come JwtUser.
 *
 * Utilizzo:
 *   @CurrentUser() user: JwtUser
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();

    // Passport inserisce req.user dopo la validazione JWT
    const user = request.user;

    if (!user) {
      // Nessun utente presente → ritorno un oggetto vuoto tipato
      return {
        id: '',
        sub: '',
        email: '',
        role: '',
        associationId: null,
      };
    }

    return user as JwtUser;
  },
);
