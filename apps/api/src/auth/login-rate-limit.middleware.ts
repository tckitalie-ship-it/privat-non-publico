import { Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";

const attempts = new Map<string, { count: number; lastAttempt: number }>();

@Injectable()
export class LoginRateLimitMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const ip = req.ip || req.connection.remoteAddress;

    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minuti
    const maxAttempts = 5;

    const entry = attempts.get(ip);

    if (!entry) {
      attempts.set(ip, { count: 1, lastAttempt: now });
      return next();
    }

    // reset finestra temporale
    if (now - entry.lastAttempt > windowMs) {
      attempts.set(ip, { count: 1, lastAttempt: now });
      return next();
    }

    entry.count++;
    entry.lastAttempt = now;

    if (entry.count > maxAttempts) {
      throw new HttpException(
        "Troppi tentativi di login. Riprova tra qualche minuto.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }
}
