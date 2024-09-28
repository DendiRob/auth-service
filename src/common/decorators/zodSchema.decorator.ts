import 'reflect-metadata';
import { ZodSchema as ZodSchemaType } from 'zod';

const ZOD_SCHEMA_KEY = 'zod:schema';

export const ZodSchema = (schema: ZodSchemaType) => {
  return (target: any) => {
    Reflect.defineMetadata(ZOD_SCHEMA_KEY, schema, target);
  };
};

export const getZodSchema = (target: any): ZodSchemaType | undefined => {
  return Reflect.getMetadata(ZOD_SCHEMA_KEY, target);
};
