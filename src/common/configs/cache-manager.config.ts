import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { CacheableMemory } from 'cacheable';

//  TODO: объявить переменные. настроить авторизацию в бд, настроить конфиг и дефолтные значения по кешу
export const cacheManagerConfig: CacheModuleOptions = {
  isGlobal: true,
  useFactory: async () => {
    return {
      stores: [
        // High performance in-memory cache with LRU and TTL
        new Keyv({
          store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
        }),

        // Redis Store
        new Keyv({
          store: new KeyvRedis('redis://localhost:6379'),
        }),
      ],
    };
  },
};
