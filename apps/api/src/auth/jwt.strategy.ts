import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtUser } from "./jwt-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("JWT_SECRET") || "fallback-secret",
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    if (!payload) {
      throw new UnauthorizedException("Payload JWT mancante");
    }

    return {
      id: payload.sub, // CORRETTO: il JWT usa sub come id
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      associationId: payload.associationId ?? null,
    };
  }
}
