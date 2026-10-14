package com.digitalvault.controller;

import com.digitalvault.dto.UserProfileResponse;
import com.digitalvault.dto.AdminUserResponse;
import com.digitalvault.dto.ChangePasswordRequest;
import com.digitalvault.dto.CreateUserRequest;
import com.digitalvault.dto.UpdateProfileRequest;
import com.digitalvault.dto.UpdateUserRequest;
import com.digitalvault.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getCurrentUserProfile(email));
    }

    @PutMapping("/user/me")
    public ResponseEntity<UserProfileResponse> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request,
                                                                 Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/user/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<AdminUserResponse>> listUsers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.listUsers(search));
    }

    @PostMapping("/admin/users")
    public ResponseEntity<AdminUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(@PathVariable Long id,
                                                        @Valid @RequestBody UpdateUserRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(userService.updateUser(id, request, authentication.getName()));
    }
}
