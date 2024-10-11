import { UserController } from '#/modules/user/controllers/user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from '#/modules/user/usecases/register.usecase';
import { LoginUseCase } from '#/modules/user/usecases/login.usecase';
import { ProfileUseCase } from '#/modules/user/usecases/profile.usecase';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ZodError } from 'zod';
import {
  UserAlreadyExists,
  InvalidCredentials,
  InvalidNewPassword,
  InvalidOldPassword,
} from '#/modules/user/usecases/user.exceptions';
import { Result } from '#/shared/result';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';
import { DeleteUserUseCase } from '#/modules/user/usecases/delete-user.usecase';
import { EditPasswordUseCase } from '#/modules/user/usecases/edit-password.usecase';
import { EditPasswordDto } from '#/modules/user/controllers/user.dto';

describe('UserController', () => {
  let userController: UserController;
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;
  let profileUseCase: ProfileUseCase;
  let deleteUserUseCase: DeleteUserUseCase;
  let editPasswordUseCase: EditPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: RegisterUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LoginUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: EditPasswordUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    profileUseCase = module.get<ProfileUseCase>(ProfileUseCase);
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    editPasswordUseCase = module.get<EditPasswordUseCase>(EditPasswordUseCase);
  });

  describe('register', () => {
    it('should return success message when user is created', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      jest
        .spyOn(registerUseCase, 'execute')
        .mockResolvedValue(Result.success(null));

      const result = await userController.register(dto);

      expect(result).toEqual({ message: 'User created successfully' });
    });

    it('should throw BadRequestException when user already exists', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      jest
        .spyOn(registerUseCase, 'execute')
        .mockResolvedValue(Result.failure(new UserAlreadyExists()));

      await expect(userController.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when validation fails', async () => {
      const dto = { email: 'invalid-email', password: 'password' };
      jest
        .spyOn(registerUseCase, 'execute')
        .mockResolvedValue(Result.failure(new ZodError([])));

      await expect(userController.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return user data when login is successful', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const userData = User.create({
        email: 'test@example.com',
        id: 1,
        password: Password.create(dto.password),
      });
      jest
        .spyOn(loginUseCase, 'execute')
        .mockResolvedValue(Result.success(userData.data));

      const result = await userController.login(dto);

      expect(result).toEqual(userData.data.props);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const dto = { email: 'test@example.com', password: 'wrong-password' };
      jest
        .spyOn(loginUseCase, 'execute')
        .mockResolvedValue(Result.failure(new InvalidCredentials()));

      await expect(userController.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when validation fails', async () => {
      const dto = { email: 'invalid-email', password: 'password' };
      jest
        .spyOn(loginUseCase, 'execute')
        .mockResolvedValue(Result.failure(new ZodError([])));

      await expect(userController.login(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('me', () => {
    it('should return user profile data', async () => {
      const req = {
        user: Result.success({
          data: { id: 1, email: 'test@example.com', password: 'password' },
        }),
      };
      const profileData = { id: 1, email: 'test@example.com' };
      jest.spyOn(profileUseCase, 'execute').mockResolvedValue(
        Result.success(
          User.create({
            ...profileData,
            password: Password.create('password'),
          }).data,
        ),
      );

      const result = await userController.me(req);

      expect(result).toEqual(profileData);
    });

    it('should throw BadRequestException when validation fails', async () => {
      const req = { user: Result.failure(new ZodError([])) };

      await expect(userController.me(req)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const req = {
        user: Result.success({
          data: { id: 1, email: 'test@example.com', password: 'password' },
        }),
      };
      jest
        .spyOn(profileUseCase, 'execute')
        .mockResolvedValue(Result.failure(new InvalidCredentials()));

      await expect(userController.me(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('delete', () => {
    it('should return user profile data after deletion', async () => {
      const req = {
        user: User.create({
          id: 1,
          email: 'test@example.com',
          password: Password.create('password'),
        }).data,
      };

      jest
        .spyOn(deleteUserUseCase, 'execute')
        .mockResolvedValue(Result.success(null));

      const result = await userController.deleteMe(req);

      expect(result).toEqual({
        message: 'User deleted successfully',
      });
    });

    it('should throw BadRequestException when validation fails', async () => {
      const req = { user: Result.failure(new ZodError([])) };

      await expect(userController.deleteMe(req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('updateMe', () => {
    it('should return success message when password is updated', async () => {
      const req = {
        user: User.create({
          id: 1,
          email: 'test@example.com',
          password: Password.create('password'),
        }),
      };

      const dto: EditPasswordDto = {
        new_password: 'newPassword',
        new_password_confirmation: 'newPassword',
        old_password: 'password',
      };
      jest
        .spyOn(editPasswordUseCase, 'execute')
        .mockResolvedValue(Result.success(null));

      const result = await userController.updateMe(req, dto);

      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw BadRequestException when validation fails', async () => {
      const req = { user: Result.failure(new ZodError([])) };

      const dto: EditPasswordDto = {
        new_password: 'newPassword',
        new_password_confirmation: 'newPassword',
        old_password: 'password',
      };

      await expect(userController.updateMe(req, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const req = {
        user: User.create({
          id: 1,
          email: 'test@example.com',
          password: Password.create('password'),
        }),
      };

      const dto: EditPasswordDto = {
        new_password: 'newPassword',
        new_password_confirmation: 'newPassword',
        old_password: 'password',
      };

      jest
        .spyOn(editPasswordUseCase, 'execute')
        .mockResolvedValue(Result.failure(new InvalidCredentials()));

      await expect(userController.updateMe(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when old password is incorrect', async () => {
      const req = {
        user: User.create({
          id: 1,
          email: 'test@example.com',
          password: Password.create('password'),
        }),
      };

      const dto: EditPasswordDto = {
        new_password: 'newPassword',
        new_password_confirmation: 'newPassword',
        old_password: 'password',
      };
      jest
        .spyOn(editPasswordUseCase, 'execute')
        .mockResolvedValue(Result.failure(new InvalidOldPassword()));

      await expect(userController.updateMe(req, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when new password is invalid', async () => {
      const req = {
        user: User.create({
          id: 1,
          email: 'test@example.com',
          password: Password.create('password'),
        }),
      };

      const dto: EditPasswordDto = {
        new_password: 'newPassword',
        new_password_confirmation: 'newPassword',
        old_password: 'password',
      };
      jest
        .spyOn(editPasswordUseCase, 'execute')
        .mockResolvedValue(
          Result.failure(new InvalidNewPassword('password is too short')),
        );

      await expect(userController.updateMe(req, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
