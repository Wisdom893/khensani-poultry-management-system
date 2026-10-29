
package com.khensani.poultry.service;

import com.khensani.poultry.entity.Department;
import com.khensani.poultry.entity.Employee;
import com.khensani.poultry.repository.DepartmentRepository;
import com.khensani.poultry.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee with id " + id + " not found"));
    }

    @Transactional
    public Employee createEmployee(Employee employee) {
        employee.setEmployeeNumber(employee.getEmployeeNumber().trim());

        if (employeeRepository.existsByEmployeeNumberIgnoreCase(
                employee.getEmployeeNumber())) {
            throw new IllegalArgumentException(
                    "Employee with employee number "
                            + employee.getEmployeeNumber() + " already exists");
        }

        if (employee.getEmail() != null && !employee.getEmail().isBlank()) {
            employee.setEmail(employee.getEmail().trim());

            if (employeeRepository.existsByEmailIgnoreCase(employee.getEmail())) {
                throw new IllegalArgumentException(
                        "Employee with email " + employee.getEmail()
                                + " already exists");
            }
        } else {
            employee.setEmail(null);
        }

        Department department = departmentRepository
                .findById(employee.getDepartment().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department with id "
                                + employee.getDepartment().getId() + " not found"));

        employee.setDepartment(department);

        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existingEmployee = getEmployeeById(id);

        // Update employee number and check for duplicates.
        String employeeNumber = updatedEmployee.getEmployeeNumber().trim();

        if (employeeRepository.existsByEmployeeNumberIgnoreCase(employeeNumber)
                && !existingEmployee.getEmployeeNumber()
                        .equalsIgnoreCase(employeeNumber)) {
            throw new IllegalArgumentException(
                    "Employee number " + employeeNumber + " is already in use");
        }

        // Update email and check for duplicates.
        String email = updatedEmployee.getEmail();

        if (email != null && !email.isBlank()) {
            email = email.trim();

            if (employeeRepository.existsByEmailIgnoreCase(email)
                    && (existingEmployee.getEmail() == null
                    || !existingEmployee.getEmail().equalsIgnoreCase(email))) {
                throw new IllegalArgumentException(
                        "Email " + email + " is already in use");
            }
        } else {
            email = null;
        }

        // Find the selected department.
        if (updatedEmployee.getDepartment() == null
                || updatedEmployee.getDepartment().getId() == null) {
            throw new IllegalArgumentException("Please select a department");
        }

        Department department = departmentRepository
                .findById(updatedEmployee.getDepartment().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department with id "
                                + updatedEmployee.getDepartment().getId()
                                + " not found"));

        // Update the existing employee without creating a new record.
        existingEmployee.setEmployeeNumber(employeeNumber);
        existingEmployee.setFirstName(updatedEmployee.getFirstName().trim());
        existingEmployee.setSurname(updatedEmployee.getSurname().trim());
        existingEmployee.setEmail(email);
        existingEmployee.setPhoneNumber(updatedEmployee.getPhoneNumber());
        existingEmployee.setJobTitle(updatedEmployee.getJobTitle().trim());
        existingEmployee.setStatus(updatedEmployee.getStatus());
        existingEmployee.setDepartment(department);

        return employeeRepository.save(existingEmployee);
    }
}
