import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { TRolePermissionWithPermission } from './types/rolePermission.service.types';

@Injectable()
export class RolePermissionService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPermissionsByRoleId(
    roleId: number,
  ): Promise<TRolePermissionWithPermission[]> {
    const cacheKey = `rolePermission:roleId:${roleId}`;
    // TODO: Сделать обертку для работы с редис,чтобы не боилерплейтить в таком формате
    const permissionsFromCache: TRolePermissionWithPermission[] | null =
      await this.cacheManager.get(cacheKey);

    if (permissionsFromCache) return permissionsFromCache;

    const permissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        Permission: true,
      },
    });

    if (permissions) {
      await this.cacheManager.set(cacheKey, permissions, 300_000);
    }

    return permissions;
  }
}
