import { Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";

const ipAttempts = new Map<string, { count: number; lastAttempt: number }>();
const emailAttempts = new Map<string, { count: number; lastAttempt: number }>();

@Injectable()
export class LoginRateLimitMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body?.email;

    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minuti
    const maxAttempts = 5;

    //
    // RATE LIMIT PER IP
    //
    const ipEntry = ipAttempts.get(ip);

    if (!ipEntry) {
      ipAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
      if (now - ipEntry.lastAttempt > windowMs) {
        ipAttempts.set(ip, { count: 1, lastAttempt: now });
      } else {
        ipEntry.count++;
        ipEntry.lastAttempt = now;

        if (ipEntry.count > maxAttempts) {
          throw new HttpException(
            "Troppi tentativi di login da questo IP. Riprova tra qualche minuto.",
            HttpStatus.TOO_MANY_REQUESTS
          );
        }
      }
    }

    //
    // RATE LIMIT PER EMAIL
    //
    if (email) {
      const emailEntry = emailAttempts.get(email);

      if (!emailEntry) {
        emailAttempts.set(email, { count: 1, lastAttempt: now });
      } else {
        if (now - emailEntry.lastAttempt > windowMs) {
          emailAttempts.set(email, { count: 1, lastAttempt: now });
        } else {
          emailEntry.count++;
          emailEntry.lastAttempt = now;

          if (emailEntry.count > maxAttempts) {
            throw new HttpException(
              "Troppi tentativi di login per questa email. Riprova tra qualche minuto.",
              HttpStatus.TOO_MANY_REQUESTS
            );
          }
        }
      }
    }

    next();
  }
}
