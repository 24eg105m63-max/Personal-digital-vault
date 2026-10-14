package com.digitalvault.dto;

import java.time.LocalDateTime;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventName,
        String category,
        String venue,
        java.time.LocalDate eventDate,
        java.time.LocalTime eventTime,
        Long studentId,
        String studentName,
        String studentEmail,
        String studentPhone,
        LocalDateTime registeredAt
) {}