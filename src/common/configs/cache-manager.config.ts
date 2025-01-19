import { createKeyv } from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';

//  TODO: объявить переменные. настроить авторизацию в бд, настроить конфиг и дефолтные значения по кешу
export const cacheManagerConfig: CacheModuleOptions = {
  isGlobal: true,
  useFactory: async () => {
    const redis = createKeyv('redis://localhost:6379', {
      namespace: process.env.REDIS_NAMESPACE,
      keyPrefixSeparator: ':',
    });

    return {
      stores: [redis],
    };
  },
};
