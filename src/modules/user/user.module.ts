import { JwtStrategy } from '#/core/auth/jwt.strategy';
import { UserController } from '#/modules/user/controllers/user.controller';
import { UserUseCaseModule } from '#/modules/user/usecases/user.usecases.module';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  imports: [UserUseCaseModule],
  providers: [JwtStrategy],
})
export class UserModule {}
