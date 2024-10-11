import { UserSchema } from '#/core/db/schema/UserSchema';
import User from '#/modules/user/domain/entities/user';
import { UserRepository } from '#/modules/user/domain/user.repository.interface';
import { UserMapper } from '#/modules/user/infra/user.mapper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserDbRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly userSchema: Repository<UserSchema>,
  ) {}
  update(user: User): Promise<void> {
    this.userSchema.update(user.props.id, UserMapper.toSchema(user));
    return;
  }

  save(user: User): Promise<void> {
    this.userSchema.save(UserMapper.toSchema(user));
    return;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userSchema.findOne({
      where: {
        email,
      },
      loadEagerRelations: true,
    });
    if (!user) {
      return null;
    }
    return UserMapper.toDomain(user);
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.userSchema.delete({ email });
  }
}
