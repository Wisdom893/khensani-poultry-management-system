
package com.khensani.poultry.dto;

import com.khensani.poultry.entity.User;
import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String role;
    private boolean enabled;
    private Long employeeId;
    private String employeeName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String username,
            String role,
            boolean enabled,
            Long employeeId,
            String employeeName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.enabled = enabled;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserResponse fromEntity(User user) {
        Long employeeId = null;
        String employeeName = null;

        if (user.getEmployee() != null) {
            employeeId = user.getEmployee().getId();
            employeeName = user.getEmployee().getFirstName()
                    + " " + user.getEmployee().getSurname();
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.isEnabled(),
                employeeId,
                employeeName,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
