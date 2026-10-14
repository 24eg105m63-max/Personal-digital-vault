package com.digitalvault.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EventResponse(
        Long id,
        String name,
        String description,
        LocalDate eventDate,
        LocalTime eventTime,
        String venue,
        String category,
        int maximumParticipants,
        int registeredParticipants,
        LocalDateTime createdAt
) {}