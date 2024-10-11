import { UserSchema } from '#/core/db/schema/UserSchema';
import User from '#/modules/user/domain/entities/user';
import { Password } from '#/modules/user/domain/valueObjects/password';

export class UserMapper {
  static toDomain(raw: UserSchema): User {
    const user = User.create({
      email: raw.email,
      password: Password.create(raw.password),
    });

    if (user.isFailure) {
      return null;
    }

    return user.data;
  }

  static toSchema(user: User): UserSchema {
    return {
      id: user.props.id.toString(),
      email: user.props.email,
      password: user.props.password.hashedValue(),
      employee: undefined,
    };
  }
}
