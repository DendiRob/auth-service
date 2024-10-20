import { ConfigModuleOptions } from '@nestjs/config';

export default {
  envFilePath: `.env.${process.env.NODE_ENV}`,
} as ConfigModuleOptions;
