package com.digitalvault.dto;

public record AdminVaultStatsResponse(long userCount, long fileCount, long noteCount, long credentialCount) { }
