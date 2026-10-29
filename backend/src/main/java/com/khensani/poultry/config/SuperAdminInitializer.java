
package com.khensani.poultry.config;

import com.khensani.poultry.entity.User;
import com.khensani.poultry.entity.UserRole;
import com.khensani.poultry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SuperAdminInitializer {

    @Bean
    public ApplicationRunner initializeSuperAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${khensani.admin.username:}") String username,
            @Value("${khensani.admin.password:}") String password) {

        return args -> {
            boolean superAdminExists = userRepository.findAll()
                    .stream()
                    .anyMatch(user -> user.getRole() == UserRole.SUPER_ADMIN);

            if (superAdminExists) {
                System.out.println("Super Admin account already exists.");
                return;
            }

            if (username == null || username.isBlank()
                    || password == null || password.length() < 12) {
                System.out.println(
                        "Super Admin not created. Configure a username and "
                        + "a password of at least 12 characters.");
                return;
            }

            User admin = new User();
            admin.setUsername(username.trim());
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(UserRole.SUPER_ADMIN);
            admin.setEnabled(true);

            userRepository.save(admin);

            System.out.println("Initial Super Admin account created.");
        };
    }
}
