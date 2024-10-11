import { Password } from '#/modules/user/domain/valueObjects/password';
import { Entity } from '#/shared/domain/entity';
import { Result } from '#/shared/result';
import { z, ZodError } from 'zod';

const userProps = z.object({
  id: z.number().optional(),
  email: z.string(),
  password: z.instanceof(Password),
  accessToken: z.string().optional(),
  isVerified: z.boolean().optional(),
});

type UserProps = z.infer<typeof userProps>;

class User extends Entity<UserProps> {
  constructor(props: UserProps) {
    super(props);

    this.props.accessToken = props.accessToken;
    this.props.email = props.email;
    this.props.id = props.id;
    this.props.isVerified = props.isVerified;
    this.props.password = props.password;
  }

  static create(props?: UserProps): Result<User, ZodError> {
    const user = userProps.safeParse(props);
    if (user.error) {
      return Result.failure(user.error);
    }
    return Result.success(new User(user.data));
  }

  equals(object?: User): boolean {
    if (object == null || object == undefined) return false;
    return this.props.id === object.props.id;
  }
}

export default User;
