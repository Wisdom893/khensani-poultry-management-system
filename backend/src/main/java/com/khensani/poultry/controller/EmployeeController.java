
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.Employee;
import com.khensani.poultry.service.EmployeeService;
import com.khensani.poultry.service.RolePermissionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(
            EmployeeService employeeService,
            RolePermissionService rolePermissionService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'EMPLOYEES', 'VIEW')")
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'EMPLOYEES', 'VIEW')")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'EMPLOYEES', 'CREATE')")
    public Employee createEmployee(
            @Valid @RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'EMPLOYEES', 'EDIT')")
    public Employee updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }
}
