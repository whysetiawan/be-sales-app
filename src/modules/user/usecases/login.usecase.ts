import { LoginUserDto } from '#/modules/user/controllers/user.dto';
import User from '#/modules/user/domain/entities/user';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { InvalidCredentials } from '#/modules/user/usecases/user.exceptions';
import { InternalException } from '#/shared/internal.exception';
import { Result } from '#/shared/result';
import { UseCase } from '#/shared/usecase';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ZodError } from 'zod';
import { Password } from '#/modules/user/domain/valueObjects/password';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';

type LoginUseCaseResult = Result<
  User,
  InvalidCredentials | ZodError | InternalException
>;

@Injectable()
export class LoginUseCase
  implements UseCase<LoginUserDto, Promise<LoginUseCaseResult>>
{
  constructor(
    private readonly userRepository: UserDbRepositoryImpl,
    private readonly userCacheRepository: UserCacheRepositoryImpl,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request?: LoginUserDto): Promise<LoginUseCaseResult> {
    const userOrError = User.create({
      email: request.email,
      password: Password.create(request.password),
    });

    if (userOrError.isFailure) {
      return Result.failure(userOrError.error);
    }

    let user = userOrError.data;

    const existingUser = await this.userRepository.findByEmail(
      user.props.email,
    );
    if (!existingUser) {
      return Result.failure(new InvalidCredentials());
    }

    const isPasswordValid = existingUser.props.password.compare(
      user.props.password.getValue(),
    );

    if (!isPasswordValid) {
      return Result.failure(new InvalidCredentials());
    }
    user = existingUser;
    const accessToken = this.jwtService.sign(user.props);
    user.props.accessToken = accessToken;

    await this.userCacheRepository.save(user);

    return Result.success(user);
  }
}
