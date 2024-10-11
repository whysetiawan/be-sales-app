import User from '#/modules/user/domain/entities/user';
import { UserRepository } from '#/modules/user/domain/user.repository.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UserCacheRepositoryImpl implements UserRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  save(user: User): Promise<void> {
    this.cacheManager.set(user.props.email, user);
    return;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.cacheManager.get(email);
  }

  deleteByEmail(email: string): Promise<void> {
    this.cacheManager.del(email);
    return;
  }

  update(user: User): Promise<void> {
    this.cacheManager.set(user.props.email, user);
    return;
  }
}
