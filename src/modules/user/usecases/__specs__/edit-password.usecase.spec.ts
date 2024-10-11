import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { EditPasswordUseCase } from '#/modules/user/usecases/edit-password.usecase';
import {
  InvalidCredentials,
  InvalidNewPassword,
  InvalidOldPassword,
} from '#/modules/user/usecases/user.exceptions';
import { TestingModule, Test } from '@nestjs/testing';

describe('EditUserUseCase', () => {
  let useCase: EditPasswordUseCase;
  let userRepository: UserDbRepositoryImpl;
  let userCacheRepository: UserCacheRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditPasswordUseCase,
        {
          provide: UserDbRepositoryImpl,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserCacheRepositoryImpl,
          useValue: {
            update: jest.fn(),
            deleteByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<EditPasswordUseCase>(EditPasswordUseCase);
    userRepository = module.get<UserDbRepositoryImpl>(UserDbRepositoryImpl);
    userCacheRepository = module.get<UserCacheRepositoryImpl>(
      UserCacheRepositoryImpl,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userCacheRepository).toBeDefined();
  });

  it('should return InvalidCredentials if user does not exist', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'test@email.com',
      new_password: 'newpassword',
      new_password_confirmation: 'newpassword',
      old_password: 'oldpassword',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it('should throw an error if old password is incorrect', async () => {
    const userData = new User({
      email: 'test@email.com',
      password: Password.create('oldpassword'),
    });
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(userData);
    jest.spyOn(userData.props.password, 'compare').mockReturnValue(false);

    const result = await useCase.execute({
      email: 'test@email.com',
      new_password: 'newpassword',
      new_password_confirmation: 'newpassword',
      old_password: 'wrongpassword',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidOldPassword);
  });

  it('should throw an error if new password and new password confirmation do not match', async () => {
    const userData = new User({
      email: 'test@email.com',
      password: Password.create(''),
    });
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(userData);
    jest.spyOn(userData.props.password, 'compare').mockReturnValue(true);

    const result = await useCase.execute({
      email: 'test@email.com',
      new_password: 'newpassword',
      new_password_confirmation: 'newpassword1',
      old_password: 'oldpassword',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidNewPassword);
    expect(result.error.message).toBe(
      'New password and new password confirmation must be the same',
    );
  });

  it('should update user in both repositories if user exists', async () => {
    const userData = User.create({
      email: 'test@email.com',
      password: Password.create('newpassword'),
    }).data;
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(userData);
    jest.spyOn(userData.props.password, 'compare').mockReturnValue(true);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
    jest.spyOn(userCacheRepository, 'update').mockResolvedValue(undefined);

    const result = await useCase.execute({
      email: 'test@email.com',
      new_password: 'newpassword',
      new_password_confirmation: 'newpassword',
      old_password: 'oldpassword',
    });

    expect(result.isSuccess).toBe(true);
    expect(userRepository.update).toHaveBeenCalledWith(
      User.create({
        email: userData.props.email,
        password: Password.create(userData.props.password.getValue()),
      }).data,
    );
    expect(userCacheRepository.deleteByEmail).toHaveBeenCalledWith(
      userData.props.email,
    );
  });
});
