
package com.khensani.poultry.service;

import com.khensani.poultry.entity.PermissionLevel;
import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.SystemModule;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.RolePermissionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;

    public RolePermissionService(
            RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public List<RolePermission> getPermissionsByRole(UserRole role) {
        return rolePermissionRepository.findByRole(role);
    }

    public PermissionLevel getPermission(
            UserRole role,
            SystemModule systemModule) {

        if (role == UserRole.SUPER_ADMIN) {
            return PermissionLevel.FULL;
        }

        return rolePermissionRepository
                .findByRoleAndSystemModule(role, systemModule)
                .map(RolePermission::getPermissionLevel)
                .orElse(PermissionLevel.NONE);
    }

    @Transactional
    public RolePermission updatePermission(
            UserRole role,
            SystemModule systemModule,
            PermissionLevel permissionLevel) {

        if (role == UserRole.SUPER_ADMIN) {
            throw new IllegalArgumentException(
                    "Super Admin permissions cannot be changed.");
        }

        RolePermission permission = rolePermissionRepository
                .findByRoleAndSystemModule(role, systemModule)
                .orElseGet(() -> new RolePermission(
                        role,
                        systemModule,
                        permissionLevel));

        permission.setPermissionLevel(permissionLevel);

        return rolePermissionRepository.save(permission);
    }
}
