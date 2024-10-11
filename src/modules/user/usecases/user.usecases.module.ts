import { UserInfraModule } from '#/modules/user/infra/user.infra.module';
import { DeleteUserUseCase } from '#/modules/user/usecases/delete-user.usecase';
import { LoginUseCase } from '#/modules/user/usecases/login.usecase';
import { ProfileUseCase } from '#/modules/user/usecases/profile.usecase';
import { RegisterUseCase } from '#/modules/user/usecases/register.usecase';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserInfraModule],
  exports: [RegisterUseCase, LoginUseCase, ProfileUseCase, DeleteUserUseCase],
  providers: [RegisterUseCase, LoginUseCase, ProfileUseCase, DeleteUserUseCase],
})
export class UserUseCaseModule {}
