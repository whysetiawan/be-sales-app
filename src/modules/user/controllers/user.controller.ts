import { JwtAuthGuard } from '#/core/auth/auth.guard';
import {
  EditPasswordDto,
  LoginUserDto,
  RegisterUserDto,
} from '#/modules/user/controllers/user.dto';
import User from '#/modules/user/domain/entities/user';
import { DeleteUserUseCase } from '#/modules/user/usecases/delete-user.usecase';
import { EditPasswordUseCase } from '#/modules/user/usecases/edit-password.usecase';
import { LoginUseCase } from '#/modules/user/usecases/login.usecase';
import { ProfileUseCase } from '#/modules/user/usecases/profile.usecase';
import { RegisterUseCase } from '#/modules/user/usecases/register.usecase';
import {
  InvalidCredentials,
  InvalidNewPassword,
  InvalidOldPassword,
  UserAlreadyExists,
} from '#/modules/user/usecases/user.exceptions';
import { Result } from '#/shared/result';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Controller('api/user')
export class UserController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly profileUseCase: ProfileUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly editPasswordUseCase: EditPasswordUseCase,
  ) {}

  @Post('')
  async register(@Body() dto: RegisterUserDto) {
    const result = await this.registerUseCase.execute(dto);

    if (result.isSuccess) {
      return {
        message: 'User created successfully',
      };
    }

    if (result.error instanceof UserAlreadyExists) {
      throw new BadRequestException('User already exists');
    }

    if (result.error instanceof ZodError) {
      throw new BadRequestException(result.error.flatten());
    }
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const result = await this.loginUseCase.execute(dto);
    if (result.isSuccess) {
      return result.data.props;
    }

    if (result.error instanceof InvalidCredentials) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (result.error instanceof ZodError) {
      throw new BadRequestException(result.error.flatten());
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    const user = req.user as Result<User, ZodError>;

    if (user.error instanceof ZodError) {
      throw new BadRequestException(user.error.errors);
    }

    const result = await this.profileUseCase.execute(user.data);

    if (result.isSuccess) {
      delete result.data.props.password;
      return result.data.props;
    }

    if (result.error instanceof InvalidCredentials) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Request() req) {
    const user = req.user as Result<User, ZodError>;

    if (user.error instanceof ZodError) {
      throw new BadRequestException(user.error.errors);
    }

    const result = await this.deleteUserUseCase.execute(user.data);

    if (result.isSuccess) {
      return {
        message: 'User deleted successfully',
      };
    }

    if (result.error instanceof InvalidCredentials) {
      throw new UnauthorizedException('Invalid credentials');
    }

    throw new InternalServerErrorException(result.error.message);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updateMe(@Request() req, @Body() dto: EditPasswordDto) {
    const user = req.user as Result<User, ZodError>;

    if (user.error instanceof ZodError) {
      throw new BadRequestException(user.error.flatten());
    }

    const result = await this.editPasswordUseCase.execute({
      email: user.data.props.email,
      ...dto,
    });

    if (result.isSuccess) {
      return {
        message: 'Password updated successfully',
      };
    }

    if (result.error instanceof InvalidCredentials) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (result.error instanceof ZodError) {
      throw new BadRequestException(result.error.flatten());
    }

    if (result.error instanceof InvalidOldPassword) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (result.error instanceof InvalidNewPassword) {
      throw new BadRequestException(result.error.message);
    }

    return result;
  }
}
