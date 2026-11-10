
package com.khensani.poultry.controller;

import com.khensani.poultry.entity.Department;
import com.khensani.poultry.service.DepartmentService;
import com.khensani.poultry.service.RolePermissionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentService departmentService,
            RolePermissionService rolePermissionService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'DEPARTMENTS', 'VIEW')")
    public List<Department> getAllDeparments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'DEPARTMENTS', 'VIEW')")
    public Department getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rolePermissionService.hasPermission(authentication, 'DEPARTMENTS', 'CREATE')")
    public Department createDepartment(
            @Valid @RequestBody Department department) {
        return departmentService.createDepartment(department);
    }
}
