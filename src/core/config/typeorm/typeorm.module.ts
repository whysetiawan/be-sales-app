import { EnvironmentConfigModule } from '#/core/config/environment/environment.module';
import { EnvironmentConfigService } from '#/core/config/environment/environment.service';
import { EmployeeSchema } from '#/core/db/schema/EmployeeSchema';
import { SalesSchema } from '#/core/db/schema/SalesSchema';
import { UserSchema } from '#/core/db/schema/UserSchema';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (configService: EnvironmentConfigService) => {
        return {
          type: 'postgres',
          host: configService.getDbHost(),
          port: configService.getDbPort(),
          username: configService.getDbUsername(),
          password: configService.getDbPassword(),
          database: configService.getDbName(),
          entities: [UserSchema, EmployeeSchema, SalesSchema],
          autoLoadEntities: true,
          migrations: ['src/core/db/migrations/*.ts'],
          logging: true,
          synchronize: true,
        };
      },
    }),
  ],
})
export class TypeOrmConfigModule {}
