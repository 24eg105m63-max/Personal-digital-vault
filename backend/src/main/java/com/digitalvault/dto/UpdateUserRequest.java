package com.digitalvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Size(min = 10, max = 15) String phone,
        @Pattern(regexp = "ADMIN|USER") String role,
        boolean active) { }
