import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class RolePermissionService {
  constructor(private prisma: PrismaService) {}

  async getPermissionsByRoleId(roleId: number) {
    return await this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        Permission: true,
      },
    });
  }
}
