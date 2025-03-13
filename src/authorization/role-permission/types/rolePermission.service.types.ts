import { Permission, RolePermission } from '@prisma/client';

export type TRolePermissionWithPermission = RolePermission & {
  Permission: Permission;
};
