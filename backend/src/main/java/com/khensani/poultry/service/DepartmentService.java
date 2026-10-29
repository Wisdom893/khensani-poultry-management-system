package com.khensani.poultry.service;

import com.khensani.poultry.entity.Department;
import com.khensani.poultry.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department with id " + id + " not found"));
    }

    @Transactional 
    public Department createDepartment(Department department){
        if(departmentRepository.existsByNameIgnoreCase(department.getName().trim())){
            throw new IllegalArgumentException("Department with name " + department.getName() + " already exists");
        }

        department.setName(department.getName().trim());
        return departmentRepository.save(department);
    }
}
