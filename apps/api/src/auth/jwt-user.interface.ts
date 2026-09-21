export interface JwtUser {
  /** ID utente (UUID Prisma) */
  id: string;

  /** Alias standard JWT (uguale a id) */
  sub: string;

  /** Email dellÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢utente */
  email: string;

  /** Ruolo dellÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢utente: MEMBER | ADMIN | OWNER */
  role: string;

  /** Associazione attiva dellÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢utente */
  associationId: string | null;

  platformRole: string;
}
