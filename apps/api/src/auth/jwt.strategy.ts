import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtUser } from "./jwt-user.interface";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("JWT_SECRET") || "fallback-secret",
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException("Payload JWT mancante");
    }

    const associationId = payload.associationId ?? null;
    const platformRole = payload.platformRole ?? "USER";

    if (associationId && platformRole !== "PLATFORM_OWNER") {
      const membership =
        await this.prisma.membership.findUnique({
          where: {
            userId_associationId: {
              userId: payload.sub,
              associationId,
            },
          },
          select: {
            role: true,
            association: {
              select: {
                isActive: true,
              },
            },
          },
        });

      if (
        !membership ||
        !membership.association.isActive
      ) {
        throw new UnauthorizedException(
          "Non hai accesso a questa associazione",
        );
      }
    }

    return {
      id: payload.sub,
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      associationId,
      platformRole,
    };
  }
}

