import { Test, TestingModule } from '@nestjs/testing';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { InvalidCredentials } from '#/modules/user/usecases/user.exceptions';
import { InternalException } from '#/shared/internal.exception';
import User from '#/modules/user/domain/entities/user';
import { ProfileUseCase } from '#/modules/user/usecases/profile.usecase';

describe('ProfileUseCase', () => {
  let profileUseCase: ProfileUseCase;
  let userRepository: UserDbRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileUseCase,
        {
          provide: UserDbRepositoryImpl,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    profileUseCase = module.get<ProfileUseCase>(ProfileUseCase);
    userRepository = module.get<UserDbRepositoryImpl>(UserDbRepositoryImpl);
  });

  it('should return user if email exists', async () => {
    const user = new User({ email: 'test@example.com' });
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

    const result = await profileUseCase.execute(user);

    expect(result.isSuccess).toBe(true);
    expect(result.data).toBe(user);
  });

  it('should return InvalidCredentials if email does not exist', async () => {
    const user = new User({ email: 'test@example.com' });
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

    const result = await profileUseCase.execute(user);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it('should handle repository exceptions', async () => {
    const user = new User({ email: 'test@example.com' });
    jest
      .spyOn(userRepository, 'findByEmail')
      .mockRejectedValue(new Error('Database error'));

    const result = await profileUseCase.execute(user);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InternalException);
  });
});
