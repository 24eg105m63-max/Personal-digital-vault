package com.digitalvault.dto;

public record AdminUserResponse(Long id, String name, String email, String phone, String role, boolean active) { }
