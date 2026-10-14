package com.digitalvault.config;

import com.digitalvault.entity.User;
import com.digitalvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {
    @Bean
    CommandLineRunner ensureAdministrator(UserRepository users, PasswordEncoder encoder,
                                          @Value("${app.admin.username}") String username,
                                          @Value("${app.admin.password}") String password) {
        return args -> {
            User admin = users.findByEmail(username)
                    .orElseGet(() -> new User("Vault Administrator", username, encoder.encode(password), "0000000000"));
            admin.setRole("ADMIN");
            admin.setActive(true);
            // Keep the configured local/deployment admin credentials authoritative on startup.
            admin.setPassword(encoder.encode(password));
            users.save(admin);
        };
    }
}
