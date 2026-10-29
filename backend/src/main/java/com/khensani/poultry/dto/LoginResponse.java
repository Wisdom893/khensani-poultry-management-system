
package com.khensani.poultry.dto;

public class LoginResponse {

    private Long userId;
    private String username;
    private String fullName;
    private String role;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(
            Long userId,
            String username,
            String fullName,
            String role,
            String token) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}
