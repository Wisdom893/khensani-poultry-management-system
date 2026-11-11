
package com.khensani.poultry.service;

import com.khensani.poultry.dto.CreateUserRequest;
import com.khensani.poultry.dto.UserResponse;
import com.khensani.poultry.entity.Employee;
import com.khensani.poultry.entity.User;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.EmployeeRepository;
import com.khensani.poultry.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String username = request.getUsername()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);

        // If an employee is linked, use their assigned system role.
        if (request.getEmployeeId() != null) {

            Employee employee = employeeRepository
                    .findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Employee not found"));

            boolean employeeAlreadyLinked = userRepository.findAll()
                    .stream()
                    .anyMatch(existing -> existing.getEmployee() != null
                            && existing.getEmployee().getId()
                                    .equals(employee.getId()));

            if (employeeAlreadyLinked) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This employee already has a user account");
            }

            user.setEmployee(employee);

            UserRole employeeRole = employee.getSystemRole();

            if (employeeRole == null) {
                employeeRole = UserRole.FARM_WORKER;
            }

            user.setRole(employeeRole);

        } else {
            // Standalone accounts use the selected role.
            user.setRole(request.getRole());
        }

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User account not found"));

        if (user.getRole() == UserRole.SUPER_ADMIN && !enabled) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The Super Admin account cannot be disabled here");
        }

        user.setEnabled(enabled);

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }
}
