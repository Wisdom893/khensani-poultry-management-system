package com.khensani.poultry.repository;

import com.khensani.poultry.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface EmployeeRepository extends JpaRepository<Employee, Long>{

    boolean existsByEmployeeNumberIgnoreCase(String employeeNumber);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Employee> findByEmployeeNumber(String employeeNumber);
    
}
