
package com.khensani.poultry.config;

import com.khensani.poultry.entity.PermissionLevel;
import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.SystemModule;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.RolePermissionRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RolePermissionInitializer implements CommandLineRunner {

    private final RolePermissionRepository rolePermissionRepository;

    public RolePermissionInitializer(
            RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public void run(String... args) {

        for (UserRole role : UserRole.values()) {

            // Super Admin always has full access.
            if (role == UserRole.SUPER_ADMIN) {
                continue;
            }

            for (SystemModule module : SystemModule.values()) {

                boolean permissionExists = rolePermissionRepository
                        .findByRoleAndSystemModule(role, module)
                        .isPresent();

                if (!permissionExists) {

                    PermissionLevel permission = getDefaultPermission(role, module);

                    RolePermission rolePermission = new RolePermission(role, module, permission);

                    rolePermissionRepository.save(rolePermission);
                }
            }
        }

        System.out.println(
                "Khensani default role permissions initialized successfully.");
    }

    private PermissionLevel getDefaultPermission(
            UserRole role, SystemModule module) {

        switch (role) {

            case ADMIN:
                return switch (module) {
                    case USER_MANAGEMENT -> PermissionLevel.NONE;
                    default -> PermissionLevel.FULL;
                };

            case FARM_MANAGER:
                return switch (module) {
                    case OVERVIEW, DEPARTMENTS, EMPLOYEES,
                            POULTRY_HOUSES, FLOCK_MANAGEMENT,
                            TASKS_AND_CLEANING, INVENTORY,
                            DRIVERS_AND_VEHICLES, DELIVERIES ->
                        PermissionLevel.FULL;
                    default -> PermissionLevel.NONE;
                };

            case DEPARTMENT_MANAGER:
                return switch (module) {
                    case OVERVIEW, DEPARTMENTS, EMPLOYEES,
                            TASKS_AND_CLEANING ->
                        PermissionLevel.FULL;
                    case POULTRY_HOUSES, FLOCK_MANAGEMENT,
                            INVENTORY ->
                        PermissionLevel.VIEW;
                    default -> PermissionLevel.NONE;
                };

            case VETERINARY_OFFICER:
                return switch (module) {
                    case OVERVIEW, POULTRY_HOUSES ->
                        PermissionLevel.VIEW;
                    case FLOCK_MANAGEMENT ->
                        PermissionLevel.FULL;
                    default -> PermissionLevel.NONE;
                };

            case INVENTORY_OFFICER:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case INVENTORY -> PermissionLevel.FULL;
                    case POULTRY_HOUSES, FLOCK_MANAGEMENT ->
                        PermissionLevel.VIEW;
                    default -> PermissionLevel.NONE;
                };

            case SALES_OFFICER:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case SALES -> PermissionLevel.FULL;
                    case INVENTORY, DELIVERIES ->
                        PermissionLevel.VIEW;
                    default -> PermissionLevel.NONE;
                };

            case DELIVERY_MANAGER:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case DRIVERS_AND_VEHICLES, DELIVERIES ->
                        PermissionLevel.FULL;
                    case INVENTORY -> PermissionLevel.VIEW;
                    default -> PermissionLevel.NONE;
                };

            case DRIVER:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case DRIVERS_AND_VEHICLES, DELIVERIES ->
                        PermissionLevel.CREATE;
                    default -> PermissionLevel.NONE;
                };

            case FARM_WORKER:
                return switch (module) {
                    case OVERVIEW, POULTRY_HOUSES ->
                        PermissionLevel.VIEW;
                    case FLOCK_MANAGEMENT, TASKS_AND_CLEANING ->
                        PermissionLevel.CREATE;
                    default -> PermissionLevel.NONE;
                };

            case ACCOUNTANT:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case FINANCE -> PermissionLevel.FULL;
                    case SALES, DELIVERIES, INVENTORY ->
                        PermissionLevel.VIEW;
                    default -> PermissionLevel.NONE;
                };

            case HR_OFFICER:
                return switch (module) {
                    case OVERVIEW -> PermissionLevel.VIEW;
                    case EMPLOYEES, DEPARTMENTS ->
                        PermissionLevel.FULL;
                    default -> PermissionLevel.NONE;
                };

            case AUDITOR:
                return PermissionLevel.VIEW;

            default:
                return PermissionLevel.NONE;
        }
    }
}
