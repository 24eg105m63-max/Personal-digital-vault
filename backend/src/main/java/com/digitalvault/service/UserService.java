package com.digitalvault.service;

import com.digitalvault.dto.AdminUserResponse;
import com.digitalvault.dto.ChangePasswordRequest;
import com.digitalvault.dto.CreateUserRequest;
import com.digitalvault.dto.UpdateProfileRequest;
import com.digitalvault.dto.UpdateUserRequest;
import com.digitalvault.dto.UserProfileResponse;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        return toProfile(findByEmail(email));
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers(String search) {
        List<User> users = search == null || search.isBlank()
                ? userRepository.findAll().stream().sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName())).toList()
                : userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByNameAsc(search.trim(), search.trim());
        return users.stream().map(this::toAdminResponse).toList();
    }

    @Transactional
    public AdminUserResponse createUser(CreateUserRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT, "An account with that email already exists");
        User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()), request.phone().trim());
        user.setRole(request.role() == null || request.role().isBlank() ? "USER" : request.role());
        return toAdminResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, UpdateUserRequest request, String actorEmail) {
        User user = userRepository.findById(id).orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        boolean self = user.getEmail().equalsIgnoreCase(actorEmail);
        if (self && !request.active()) {
            throw new ApiException("You cannot deactivate your own account");
        }
        user.setName(request.name().trim());
        user.setPhone(request.phone().trim());
        user.setRole(request.role() == null || request.role().isBlank() ? user.getRole() : request.role());
        user.setActive(request.active());
        return toAdminResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        user.setName(request.name().trim());
        user.setPhone(request.phone().trim());
        return toProfile(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole(), user.isActive());
    }
}
