import { EmployeeSchema } from '#/core/db/schema/EmployeeSchema';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'sales',
  schema: 'public',
})
export class SalesSchema {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  sales: number;

  @ManyToOne(() => EmployeeSchema)
  employee: EmployeeSchema;
}
