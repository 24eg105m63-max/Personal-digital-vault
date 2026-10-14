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
                                          @Value("${app.admin.email}") String email,
                                          @Value("${app.admin.password}") String password,
                                          @Value("${app.admin.name}") String name,
                                          @Value("${app.admin.phone}") String phone) {
        return args -> {
            User admin = users.findByEmail(email).orElseGet(() -> new User(name, email, encoder.encode(password), phone));
            admin.setRole("ADMIN");
            users.save(admin);
        };
    }
}