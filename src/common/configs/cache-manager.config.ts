import { createKeyv } from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheManagerConfig: CacheModuleOptions = {
  isGlobal: true,
  useFactory: async () => {
    try {
      const redis = createKeyv(process.env.REDIS_URL, {
        namespace: process.env.REDIS_NAMESPACE,
        keyPrefixSeparator: ':',
      });

      redis.on('error', (error) => {
        console.log('Ошибка при подключении к Redis', error);
      });

      return {
        stores: [redis],
      };
    } catch (error) {
      console.log(error);
    }
  },
};
