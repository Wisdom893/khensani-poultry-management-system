
package com.khensani.poultry.controller;

import com.khensani.poultry.dto.LoginRequest;
import com.khensani.poultry.dto.LoginResponse;
import com.khensani.poultry.entity.User;
import com.khensani.poultry.service.AuthService;
import com.khensani.poultry.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            AuthService authService,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getUsername(),
                                    request.getPassword()));

            User user = authService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Invalid username or password"));

            String fullName = user.getEmployee() == null
                    ? user.getUsername()
                    : user.getEmployee().getFirstName() + " "
                            + user.getEmployee().getSurname();

            String token = jwtService.generateToken(
                    user.getUsername(),
                    user.getRole().name());

            return new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    fullName,
                    user.getRole().name(),
                    token);

        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password");
        }
    }
}
