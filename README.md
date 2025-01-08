# Проект "Сервис авторизации" (NestJS)

Проект "Сервис авторизации" был написан для демонстарции NestJS навыков и дальнейшего использования в более крупных проектах. Данный сервис имеет гибридный метод авторизации (sessions + jwt-based). Сообщество NestJS неоднозначно отнеслась к такой реализации, но пока я решил оставить всё как есть.

# Технологический стек

- GraphQL
- PostgreSQL
- PrismaORM
- TypeScript
- React Email
- Zod
- passport
- Jest

Проект разработан на языке запросов GraphQL. Внутреннее взаимодействие строится на PrismaORM + PostgreSQL. Проект находится в стадии написания тестов (библиотека Jest для тестирования). Также я решил воспользоваться библиотекой passport, так как в будущем планирую добавить авторизацию через VK OAuth и TG OAuth. Гибкая валидация с библиотекой Zod, а также красивые электронные письма с React Email.

# Запуск проекта

## Установка проекта

```bash
$ yarn install
```

## Инициация Prisma схемы для БД

```bash
$ npx prisma db push
```

## Запуск и билд проекта

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Запуск тестов

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

# TODO

- Дописать тесты
- Разобраться с моками в тестах
- Интегрировать OAuth авторизацию
- Интегрировать систему ролей и доступов (role -> [permission1, permission2])
- Logger
