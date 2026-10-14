package com.digitalvault.service;

import com.digitalvault.dto.AuthResponse;
import com.digitalvault.dto.LoginRequest;
import com.digitalvault.dto.RegisterRequest;
import com.digitalvault.dto.UserProfileResponse;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.UserRepository;
import com.digitalvault.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtService jwtService,
                      AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public User register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(org.springframework.http.HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Invalid email or password"));

        String token = jwtService.generateToken(user.getEmail());
        UserProfileResponse userProfile = new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );

        return new AuthResponse(token, userProfile);
    }
}
