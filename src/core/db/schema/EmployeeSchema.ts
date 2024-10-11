import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'employees',
  schema: 'public',
})
export class EmployeeSchema {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  job_title: string;

  @Column()
  salary: number;

  @Column()
  department: string;

  @Column()
  joined_at: Date;
}
