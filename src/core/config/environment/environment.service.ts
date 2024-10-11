import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getDbHost(): string {
    return this.configService.get<string>('DB_HOST');
  }

  getDbPort(): number {
    return this.configService.get<number>('DB_PORT');
  }

  getDbUsername(): string {
    return this.configService.get<string>('DB_USERNAME');
  }

  getDbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD');
  }

  getDbName(): string {
    return this.configService.get<string>('DB_NAME');
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT');
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }
}
