
package com.khensani.poultry.service;

import com.khensani.poultry.entity.User;
import com.khensani.poultry.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }

        return userRepository.findByUsernameIgnoreCase(
                username.trim().toLowerCase(Locale.ROOT));
    }

    @Transactional
    public User createUser(User user, String rawPassword) {
        if (user == null) {
            throw new IllegalArgumentException("User details are required");
        }

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        String username = user.getUsername().trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (rawPassword == null || rawPassword.length() < 12) {
            throw new IllegalArgumentException(
                    "Password must contain at least 12 characters");
        }

        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));

        return userRepository.save(user);
    }
}
