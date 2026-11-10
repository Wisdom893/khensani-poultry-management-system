
package com.khensani.poultry.service;

import com.khensani.poultry.entity.PermissionLevel;
import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.SystemModule;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.RolePermissionRepository;

import org.springframework.security.core.Authentication;
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

    // Check whether the authenticated user has the required permission.
    public boolean hasPermission(
            Authentication authentication,
            String moduleName,
            String requiredLevelName) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String authority = authentication.getAuthorities()
                    .stream()
                    .map(Object::toString)
                    .filter(role -> role.startsWith("ROLE_"))
                    .findFirst()
                    .orElse(null);

            if (authority == null) {
                return false;
            }

            UserRole role = UserRole.valueOf(
                    authority.substring("ROLE_".length()));

            SystemModule module = SystemModule.valueOf(moduleName);

            PermissionLevel requiredLevel =
                    PermissionLevel.valueOf(requiredLevelName);

            PermissionLevel actualLevel =
                    getPermission(role, module);

            // Higher permission levels include lower permission levels.
            return actualLevel.ordinal() >= requiredLevel.ordinal();

        } catch (IllegalArgumentException exception) {
            return false;
        }
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
