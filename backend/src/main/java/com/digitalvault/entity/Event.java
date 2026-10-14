package com.digitalvault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 140)
    @Column(nullable = false, length = 140)
    private String name;

    @NotBlank
    @Size(max = 4000)
    @Column(nullable = false, length = 4000)
    private String description;

    @NotNull
    @Column(nullable = false)
    private LocalDate eventDate;

    @NotNull
    @Column(nullable = false)
    private LocalTime eventTime;

    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String venue;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String category;

    @Min(1)
    @Column(nullable = false)
    private int maximumParticipants;

    @Column(nullable = false)
    private int registeredParticipants;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations = new ArrayList<>();

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getMaximumParticipants() { return maximumParticipants; }
    public void setMaximumParticipants(int maximumParticipants) { this.maximumParticipants = maximumParticipants; }
    public int getRegisteredParticipants() { return registeredParticipants; }
    public void setRegisteredParticipants(int registeredParticipants) { this.registeredParticipants = registeredParticipants; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public List<Registration> getRegistrations() { return registrations; }
}