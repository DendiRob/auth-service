import { Permission, Prisma, PrismaClient } from '@prisma/client';
import { permissions } from './data/permissions';

const prisma = new PrismaClient();

(async () => {
  await prisma.$transaction(async (tx) => {
    await createPermissions(permissions, tx);
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
  const promises = permissions.map(async (permission: any) => {
    return await tx.permission.create({ data: permission });
  });

  return await Promise.all(promises);
}
