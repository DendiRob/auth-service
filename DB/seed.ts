import {
  Permission,
  Prisma,
  PrismaClient,
  Role,
  RolePermission,
} from '@prisma/client';
import { permissions } from './data/permissions';
import { roles } from './data/roles';
import { rolePermissions } from './data/rolePermissions';

const prisma = new PrismaClient();

(async () => {
  await prisma.$transaction(async (tx) => {
    await createPermissions(permissions, tx);
    await createRoles(roles, tx);
    await createRolePermissions(rolePermissions, tx);
  });
})()
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    console.log('Seeding is done');

    process.exit();
  });

async function createPermissions(
  permissions: Permission[],
  tx: Prisma.TransactionClient,
) {
  const promises = permissions.map(
    async (permission: any) => await tx.permission.create({ data: permission }),
  );

  return await Promise.all(promises);
}

async function createRoles(roles: Role[], tx: Prisma.TransactionClient) {
  const promises = roles.map(
    async (permission: any) => await tx.role.create({ data: permission }),
  );

  return await Promise.all(promises);
}

async function createRolePermissions(
  roles: RolePermission[],
  tx: Prisma.TransactionClient,
) {
  const promises = roles.map(
    async (permission: any) =>
      await tx.rolePermission.create({ data: permission }),
  );

  return await Promise.all(promises);
}
