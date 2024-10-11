import { UserSchema } from '#/core/db/schema/UserSchema';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UserDbRepositoryImpl, UserCacheRepositoryImpl],
  exports: [UserDbRepositoryImpl, UserCacheRepositoryImpl],
})
export class UserInfraModule {}
