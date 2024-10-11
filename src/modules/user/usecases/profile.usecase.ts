import User from '#/modules/user/domain/entities/user';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { InvalidCredentials } from '#/modules/user/usecases/user.exceptions';
import { InternalException } from '#/shared/internal.exception';
import { Result } from '#/shared/result';
import { UseCase } from '#/shared/usecase';
import { Injectable } from '@nestjs/common';

type ProfileUseCaseResult = Result<
  User,
  InvalidCredentials | InternalException
>;

@Injectable()
export class ProfileUseCase implements UseCase<User, ProfileUseCaseResult> {
  constructor(private userRepository: UserDbRepositoryImpl) {}

  async execute(request: User): Promise<ProfileUseCaseResult> {
    try {
      const exist = await this.userRepository.findByEmail(request.props.email);

      if (!exist) {
        return Result.failure(new InvalidCredentials());
      }

      return Result.success(exist);
    } catch (err) {
      return Result.failure(new InternalException());
    }
  }
}
