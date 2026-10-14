package com.digitalvault.dto;

import java.time.LocalDateTime;

/** Safe credential metadata; secrets are returned only by the explicit reveal endpoint. */
public record CredentialResponse(Long id, String serviceName, String username, LocalDateTime createdAt) {}
