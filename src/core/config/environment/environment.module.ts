import typeormConfig from '../typeorm/typeorm.config';
import { EnvironmentConfigService } from './environment.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      // ignoreEnvFile:
      //   process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test'
      //     ? false
      // : true,
      isGlobal: true,
      load: [typeormConfig],
    }),
  ],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class EnvironmentConfigModule {}
