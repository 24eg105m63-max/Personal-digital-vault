package com.digitalvault.dto;

public record AdminStatsResponse(long totalEvents, long upcomingEvents, long registrations, long students) {}