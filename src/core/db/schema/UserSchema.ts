import { EmployeeSchema } from './EmployeeSchema';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'users',
  schema: 'public',
})
export class UserSchema {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => EmployeeSchema)
  @JoinColumn()
  employee: EmployeeSchema;
}
