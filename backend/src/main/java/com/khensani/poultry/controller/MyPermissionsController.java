
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.service.RolePermissionService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-permissions")
public class MyPermissionsController {

    private final RolePermissionService rolePermissionService;

    public MyPermissionsController(
            RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @GetMapping
    public List<RolePermission> getMyPermissions(
            Authentication authentication) {

        String authority = authentication.getAuthorities()
                .stream()
                .map(Object::toString)
                .filter(role -> role.startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException("User role not found."));

        UserRole role = UserRole.valueOf(
                authority.substring("ROLE_".length()));

        return rolePermissionService.getPermissionsByRole(role);
    }
}
