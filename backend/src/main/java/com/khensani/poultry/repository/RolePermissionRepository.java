
package com.khensani.poultry.repository;

import com.khensani.poultry.entity.RolePermission;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.entity.SystemModule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository
        extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRole(UserRole role);

    Optional<RolePermission> findByRoleAndSystemModule(
            UserRole role,
            SystemModule systemModule);

    void deleteByRole(UserRole role);
}
