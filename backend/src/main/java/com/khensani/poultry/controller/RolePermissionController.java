
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.PermissionLevel;
import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.SystemModule;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.service.RolePermissionService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    public RolePermissionController(
            RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @GetMapping("/{role}")
    public List<RolePermission> getPermissionsByRole(
            @PathVariable UserRole role) {

        return rolePermissionService.getPermissionsByRole(role);
    }

    @PutMapping("/{role}/{module}")
    public RolePermission updatePermission(
            @PathVariable UserRole role,
            @PathVariable SystemModule module,
            @RequestParam PermissionLevel permissionLevel) {

        return rolePermissionService.updatePermission(
                role,
                module,
                permissionLevel);
    }
}
