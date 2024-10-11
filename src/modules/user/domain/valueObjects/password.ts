import { z } from 'zod';
import * as bcrypt from 'bcrypt';

const passwordRequirements = z.string().min(5);

export type PasswordRequirements = z.infer<typeof passwordRequirements>;

export class Password {
  constructor(private value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static create(value: string): Password {
    const password = passwordRequirements.safeParse(value);
    return new Password(password.data);
  }

  hashedValue(): string {
    return bcrypt.hashSync(this.value, 10);
  }

  compare(plainText: string): boolean {
    const hashed = this.value;
    return bcrypt.compareSync(plainText, hashed);
  }
}
