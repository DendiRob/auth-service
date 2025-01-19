import KeyvRedis from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';

//  TODO: объявить переменные. настроить авторизацию в бд, настроить конфиг и дефолтные значения по кешу
export const cacheManagerConfig: CacheModuleOptions = {
  isGlobal: true,
  useFactory: async () => {
    return {
      stores: [new KeyvRedis('redis://localhost:6379')],
    };
  },
};
