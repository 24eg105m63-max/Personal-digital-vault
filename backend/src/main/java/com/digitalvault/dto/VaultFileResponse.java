package com.digitalvault.dto;

import java.time.LocalDateTime;

public record VaultFileResponse(Long id, String originalFileName, String contentType, Long fileSize, LocalDateTime uploadedAt) { }
