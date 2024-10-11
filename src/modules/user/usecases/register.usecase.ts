import { RegisterUserDto } from '#/modules/user/controllers/user.dto';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { UserAlreadyExists } from '#/modules/user/usecases/user.exceptions';
import { Result } from '#/shared/result';
import { UseCase } from '#/shared/usecase';
import { Injectable } from '@nestjs/common';
import { ZodError } from 'zod';

type RegisterUseCaseResult = Result<void, ZodError | UserAlreadyExists>;

@Injectable()
export class RegisterUseCase
  implements UseCase<RegisterUserDto, RegisterUseCaseResult>
{
  constructor(private userRepository: UserDbRepositoryImpl) {}

  async execute(request?: RegisterUserDto): Promise<RegisterUseCaseResult> {
    const userOrError = User.create({
      email: request.email,
      password: Password.create(request.password),
    });

    if (userOrError.isFailure) {
      return Result.failure(userOrError.error);
    }

    const user = userOrError.data;

    const exist = await this.userRepository.findByEmail(user.props.email);

    if (exist) {
      return Result.failure(new UserAlreadyExists());
    }

    await this.userRepository.save(user);
    return Result.success(null);
  }
}
