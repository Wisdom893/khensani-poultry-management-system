
package com.khensani.poultry.service;

import com.khensani.poultry.entity.Department;
import com.khensani.poultry.entity.Employee;
import com.khensani.poultry.entity.User;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.DepartmentRepository;
import com.khensani.poultry.repository.EmployeeRepository;
import com.khensani.poultry.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    private static final Map<String, UserRole> JOB_TITLE_ROLES = Map.ofEntries(
            Map.entry("FARM_MANAGER", UserRole.FARM_MANAGER),
            Map.entry("DEPARTMENT_MANAGER", UserRole.DEPARTMENT_MANAGER),
            Map.entry("FARM_WORKER", UserRole.FARM_WORKER),
            Map.entry("POULTRY_HOUSE_CLEANER", UserRole.POULTRY_HOUSE_CLEANER),
            Map.entry("VETERINARY_OFFICER", UserRole.VETERINARY_OFFICER),
            Map.entry("INVENTORY_OFFICER", UserRole.INVENTORY_OFFICER),
            Map.entry("SALES_OFFICER", UserRole.SALES_OFFICER),
            Map.entry("DELIVERY_MANAGER", UserRole.DELIVERY_MANAGER),
            Map.entry("DRIVER", UserRole.DRIVER),
            Map.entry("ACCOUNTANT", UserRole.ACCOUNTANT),
            Map.entry("HR_OFFICER", UserRole.HR_OFFICER)
    );

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee with id " + id + " not found"));
    }

    private String normalizeJobTitle(String jobTitle) {
        if (jobTitle == null || jobTitle.isBlank()) {
            throw new IllegalArgumentException("Job title is required");
        }

        return jobTitle.trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_|_$", "");
    }

    private void validateJobTitleAndRole(
            String jobTitle, UserRole systemRole) {

        String normalizedTitle = normalizeJobTitle(jobTitle);

        UserRole expectedRole = JOB_TITLE_ROLES.get(normalizedTitle);

        if (expectedRole == null) {
            throw new IllegalArgumentException(
                    "Unsupported job title: " + jobTitle
                    + ". Please use an approved job title.");
        }

        if (systemRole != expectedRole) {
            throw new IllegalArgumentException(
                    "The job title '" + jobTitle
                    + "' requires the system role '" + expectedRole + "'");
        }
    }

    @Transactional
    public Employee createEmployee(Employee employee) {

        employee.setEmployeeNumber(employee.getEmployeeNumber().trim());
        employee.setJobTitle(employee.getJobTitle().trim());

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

        if (employee.getDepartment() == null
                || employee.getDepartment().getId() == null) {
            throw new IllegalArgumentException("Please select a department");
        }

        Department department = departmentRepository
                .findById(employee.getDepartment().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department with id "
                                + employee.getDepartment().getId() + " not found"));

        employee.setDepartment(department);

        if (employee.getSystemRole() == null) {
            employee.setSystemRole(UserRole.FARM_WORKER);
        }

        validateJobTitleAndRole(
                employee.getJobTitle(),
                employee.getSystemRole()
        );

        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee updatedEmployee) {

        Employee existingEmployee = getEmployeeById(id);

        String employeeNumber = updatedEmployee.getEmployeeNumber().trim();
        String jobTitle = updatedEmployee.getJobTitle().trim();

        if (employeeRepository.existsByEmployeeNumberIgnoreCase(employeeNumber)
                && !existingEmployee.getEmployeeNumber()
                        .equalsIgnoreCase(employeeNumber)) {
            throw new IllegalArgumentException(
                    "Employee number " + employeeNumber + " is already in use");
        }

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

        UserRole newSystemRole = updatedEmployee.getSystemRole() != null
                ? updatedEmployee.getSystemRole()
                : existingEmployee.getSystemRole();

        validateJobTitleAndRole(jobTitle, newSystemRole);

        existingEmployee.setEmployeeNumber(employeeNumber);
        existingEmployee.setFirstName(updatedEmployee.getFirstName().trim());
        existingEmployee.setSurname(updatedEmployee.getSurname().trim());
        existingEmployee.setEmail(email);
        existingEmployee.setPhoneNumber(updatedEmployee.getPhoneNumber());
        existingEmployee.setJobTitle(jobTitle);
        existingEmployee.setStatus(updatedEmployee.getStatus());
        existingEmployee.setDepartment(department);
        existingEmployee.setSystemRole(newSystemRole);

        Employee savedEmployee = employeeRepository.save(existingEmployee);

        // Synchronise the linked login account.
        userRepository.findAll().stream()
                .filter(user -> user.getEmployee() != null
                        && user.getEmployee().getId().equals(savedEmployee.getId()))
                .findFirst()
                .ifPresent(user -> {
                    user.setRole(savedEmployee.getSystemRole());
                    userRepository.save(user);
                });

        return savedEmployee;
    }
}
