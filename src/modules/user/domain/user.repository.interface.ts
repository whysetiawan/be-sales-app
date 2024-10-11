import User from '#/modules/user/domain/entities/user';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  deleteByEmail(email: string): Promise<void>;
  update(user: User): Promise<void>;
}
