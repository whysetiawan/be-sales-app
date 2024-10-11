import { redisStore } from 'cache-manager-redis-yet';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmConfigModule } from './core/config/typeorm/typeorm.module';
import { EnvironmentConfigModule } from '#/core/config/environment/environment.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { EnvironmentConfigService } from '#/core/config/environment/environment.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    EnvironmentConfigModule,
    TypeOrmConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: async (configService: EnvironmentConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.getRedisHost(),
            port: configService.getRedisPort(),
          },
        });
        return {
          store: store as unknown as CacheStore,
        };
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (configService: EnvironmentConfigService) => ({
        secret: configService.getJwtSecret(),
      }),
    }),
    UserModule,
  ],
})
export class AppModule {}
