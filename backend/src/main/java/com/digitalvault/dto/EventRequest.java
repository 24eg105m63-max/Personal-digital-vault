package com.digitalvault.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventRequest(
        @NotBlank @Size(max = 140) String name,
        @NotBlank @Size(max = 4000) String description,
        @NotNull LocalDate eventDate,
        @NotNull LocalTime eventTime,
        @NotBlank @Size(max = 180) String venue,
        @NotBlank @Size(max = 60) String category,
        @Min(1) int maximumParticipants
) {}