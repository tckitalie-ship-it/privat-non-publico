export interface JwtUser {
  /** ID utente (UUID Prisma) */
  id: string;

  /** Alias standard JWT (uguale a id) */
  sub: string;

  /** Email dell’utente */
  email: string;

  /** Ruolo dell’utente: MEMBER | ADMIN | OWNER */
  role: string;

  /** Associazione attiva dell’utente */
  associationId: string | null;
}
