import { EditPasswordDto } from '#/modules/user/controllers/user.dto';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import {
  InvalidCredentials,
  InvalidNewPassword,
  InvalidOldPassword,
} from '#/modules/user/usecases/user.exceptions';
import { InternalException } from '#/shared/internal.exception';
import { Result } from '#/shared/result';
import { UseCase } from '#/shared/usecase';
import { Injectable } from '@nestjs/common';

type DeleteProfileUseCaseResult = Result<
  User,
  InvalidCredentials | InternalException
>;

type EditPasswordParams = EditPasswordDto & { email: string };

@Injectable()
export class EditPasswordUseCase
  implements UseCase<EditPasswordParams, DeleteProfileUseCaseResult>
{
  constructor(
    private userRepository: UserDbRepositoryImpl,
    private readonly userCacheRepository: UserCacheRepositoryImpl,
  ) {}

  async execute(
    request: EditPasswordParams,
  ): Promise<DeleteProfileUseCaseResult> {
    const existUser = await this.userRepository.findByEmail(request.email);

    if (!existUser) {
      return Result.failure(new InvalidCredentials());
    }

    const isValidPassword = await existUser.props.password.compare(
      request.old_password,
    );

    if (!isValidPassword) {
      return Result.failure(new InvalidOldPassword());
    }

    const isNewPasswordSame =
      request.new_password === request.new_password_confirmation;

    if (!isNewPasswordSame) {
      return Result.failure(
        new InvalidNewPassword(
          'New password and new password confirmation must be the same',
        ),
      );
    }

    const newUser = User.create({
      id: existUser.props.id,
      email: request.email,
      password: Password.create(request.new_password),
    });

    if (newUser.isFailure) {
      return Result.failure(newUser.error);
    }

    await this.userRepository.update(newUser.data);
    await this.userCacheRepository.deleteByEmail(newUser.data.props.email);
    return Result.success(newUser.data);
  }
}
