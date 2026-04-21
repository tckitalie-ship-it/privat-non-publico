import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
constructor() {
  console.log('JWT SECRET USATO:', 'dev-secret-change-me');

  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: 'dev-secret-change-me',
  });
}

  async validate(payload: any) {
    console.log('PAYLOAD:', payload);
    return payload;
  }
}