import { Permission } from '@prisma/client';

const permissions: Permission[] = [
  {
    id: 1,
    action: 'read',
    subject: 'User',
    conditions: { uuid: { $in: '${user.id}' } },
    inverted: null,
    reason: null,
  },
];

export { permissions };
