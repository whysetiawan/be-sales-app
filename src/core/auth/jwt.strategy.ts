import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: User['props']) {
    /**
     * This method is called by passport-jwt when it validates the token.
     * It should return the user object if the token is valid.
     */
    return User.create({
      accessToken: payload.accessToken,
      email: payload.email,
      id: payload.id,
      isVerified: payload.isVerified,
      password: Password.create(''),
    });
  }
}
