
package com.khensani.poultry.repository;

import com.khensani.poultry.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    boolean existsByNameIgnoreCase(String name);
}
