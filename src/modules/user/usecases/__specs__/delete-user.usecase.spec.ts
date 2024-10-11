import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '../delete-user.usecase';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { InvalidCredentials } from '#/modules/user/usecases/user.exceptions';
import User from '#/modules/user/domain/entities/user';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserDbRepositoryImpl;
  let userCacheRepository: UserCacheRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UserDbRepositoryImpl,
          useValue: {
            findByEmail: jest.fn(),
            deleteByEmail: jest.fn(),
          },
        },
        {
          provide: UserCacheRepositoryImpl,
          useValue: {
            deleteByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get<UserDbRepositoryImpl>(UserDbRepositoryImpl);
    userCacheRepository = module.get<UserCacheRepositoryImpl>(
      UserCacheRepositoryImpl,
    );
  });

  it('should return InvalidCredentials if user does not exist', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

    const user = new User({ email: 'test@example.com' });
    const result = await useCase.execute(user);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it('should delete user from both repositories if user exists', async () => {
    jest
      .spyOn(userRepository, 'findByEmail')
      .mockResolvedValue(new User({ email: 'test@example.com' }));
    jest.spyOn(userRepository, 'deleteByEmail').mockResolvedValue(undefined);
    jest
      .spyOn(userCacheRepository, 'deleteByEmail')
      .mockResolvedValue(undefined);

    const user = new User({ email: 'test@example.com' });
    const result = await useCase.execute(user);

    expect(result.isSuccess).toBe(true);
    expect(userRepository.deleteByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(userCacheRepository.deleteByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });
});
