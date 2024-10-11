import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../login.usecase';
import { UserDbRepositoryImpl } from '#/modules/user/infra/user.db.repository.impl';
import { UserCacheRepositoryImpl } from '#/modules/user/infra/user.cache.repository.impl';
import { InvalidCredentials } from '../user.exceptions';
import { LoginUserDto } from '#/modules/user/controllers/user.dto';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: UserDbRepositoryImpl;
  let userCacheRepository: UserCacheRepositoryImpl;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: UserDbRepositoryImpl,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: UserCacheRepositoryImpl,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get<UserDbRepositoryImpl>(UserDbRepositoryImpl);
    userCacheRepository = module.get<UserCacheRepositoryImpl>(
      UserCacheRepositoryImpl,
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return InvalidCredentials if user does not exist', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

    const result = await loginUseCase.execute(loginUserDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it('should return InvalidCredentials if password is incorrect', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    const user = User.create({
      email: 'test@example.com',
      password: Password.create('password'),
    }).data;
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);
    jest.spyOn(user.props.password, 'compare').mockReturnValue(false);

    const result = await loginUseCase.execute(loginUserDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it('should return user with accessToken if credentials are correct', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = User.create({
      email: 'test@example.com',
      password: Password.create('password'),
    }).data;
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);
    jest.spyOn(user.props.password, 'compare').mockReturnValue(true);
    jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
    jest.spyOn(userCacheRepository, 'save').mockResolvedValue(undefined);

    const result = await loginUseCase.execute(loginUserDto);

    expect(result.isSuccess).toBe(true);
    expect(result.data.props.accessToken).toBe('accessToken');
  });
});
