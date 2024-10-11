import { EmployeeSchema } from '#/core/db/schema/EmployeeSchema';
import { SalesSchema } from '#/core/db/schema/SalesSchema';
import { UserSchema } from '#/core/db/schema/UserSchema';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [UserSchema, EmployeeSchema, SalesSchema],
  migrations: [__dirname + '/../../db/migrations/*.{ts,js}'],
  logging: true,
};

export default registerAs('typeorm', () => typeOrmConfig);

export const connection = new DataSource(typeOrmConfig);
