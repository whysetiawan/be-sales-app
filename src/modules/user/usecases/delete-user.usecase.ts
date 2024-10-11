import User from '#/modules/user/domain/entities/user';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { InvalidCredentials } from '#/modules/user/usecases/user.exceptions';
import { InternalException } from '#/shared/internal.exception';
import { Result } from '#/shared/result';
import { UseCase } from '#/shared/usecase';
import { Injectable } from '@nestjs/common';

type DeleteProfileUseCaseResult = Result<
  void,
  InvalidCredentials | InternalException
>;

@Injectable()
export class DeleteUserUseCase
  implements UseCase<User, DeleteProfileUseCaseResult>
{
  constructor(
    private userRepository: UserDbRepositoryImpl,
    private readonly userCacheRepository: UserCacheRepositoryImpl,
  ) {}

  async execute(request: User): Promise<DeleteProfileUseCaseResult> {
    const exist = await this.userRepository.findByEmail(request.props.email);

    if (!exist) {
      return Result.failure(new InvalidCredentials());
    }

    await this.userRepository.deleteByEmail(request.props.email);
    await this.userCacheRepository.deleteByEmail(request.props.email);
    return Result.success(null);
  }
}
