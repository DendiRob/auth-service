import { Permission, Prisma, PrismaClient, Role } from '@prisma/client';
import { permissions } from './data/permissions';
import { roles } from './data/roles';

const prisma = new PrismaClient();

(async () => {
  await prisma.$transaction(async (tx) => {
    await createPermissions(permissions, tx);
    await createRoles(roles, tx);
  });
})()
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
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
