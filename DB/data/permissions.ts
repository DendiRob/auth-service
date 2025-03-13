import { Permission } from '@prisma/client';

export const permissions: Permission[] = [
  {
    id: 2,
    action: 'manage',
    subject: 'all',
    conditions: null,
    inverted: null,
    reason: null,
  },
  {
    id: 1,
    action: 'read',
    subject: 'User',
    conditions: { uuid: '${user.uuid}' },
    inverted: null,
    reason: null,
  },
];
