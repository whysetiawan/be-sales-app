import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { RegisterUseCase } from '#/modules/user/usecases/register.usecase';
import { UserAlreadyExists } from '#/modules/user/usecases/user.exceptions';
import { Test, TestingModule } from '@nestjs/testing';

describe('RegisterUsecase', () => {
  let registerUseCase: RegisterUseCase;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [RegisterUseCase],
    })
      .useMocker((token) => {
        if (token === UserDbRepositoryImpl) {
          return {
            save: jest.fn(),
            findByEmail: jest.fn(),
            deleteByEmail: jest.fn(),
          };
        }
      })
      .compile();
    registerUseCase = moduleRef.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(registerUseCase).toBeDefined();
  });

  it('should register user', async () => {
    const user = {
      email: 'test@email.com',
      password: 'password',
    };
    const result = await registerUseCase.execute(user);
    expect(result.isSuccess).toBe(true);
  });

  it('should not register user if email already exists', async () => {
    /**
     * mock the findByEmail method to return true
     * so that the user already exists
     */
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [RegisterUseCase],
    })
      .useMocker((token) => {
        if (token === UserDbRepositoryImpl) {
          return {
            save: jest.fn(),
            findByEmail: jest.fn().mockResolvedValue(true),
            deleteByEmail: jest.fn(),
          };
        }
      })
      .compile();
    registerUseCase = moduleRef.get<RegisterUseCase>(RegisterUseCase);

    const user = {
      email: 'test@email.com',
      password: 'password',
    };
    const result = await registerUseCase.execute(user);
    expect(result.isSuccess).toBe(false);
    expect(result.error).toBeInstanceOf(UserAlreadyExists);
  });
});
