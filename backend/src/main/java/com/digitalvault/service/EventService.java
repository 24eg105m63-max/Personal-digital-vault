package com.digitalvault.service;

import com.digitalvault.dto.AdminStatsResponse;
import com.digitalvault.dto.EventRequest;
import com.digitalvault.dto.EventResponse;
import com.digitalvault.dto.RegistrationResponse;
import com.digitalvault.entity.Event;
import com.digitalvault.entity.Registration;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.EventRepository;
import com.digitalvault.repository.RegistrationRepository;
import com.digitalvault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, RegistrationRepository registrationRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listEvents(String search, String category, boolean upcoming) {
        String query = search == null ? "" : search.trim().toLowerCase();
        String selectedCategory = category == null ? "" : category.trim();
        return eventRepository.findAllByOrderByEventDateAscEventTimeAsc().stream()
                .filter(event -> !upcoming || !event.getEventDate().isBefore(LocalDate.now()))
                .filter(event -> selectedCategory.isBlank() || event.getCategory().equalsIgnoreCase(selectedCategory))
                .filter(event -> query.isBlank() || (event.getName() + " " + event.getDescription() + " " + event.getVenue() + " " + event.getCategory()).toLowerCase().contains(query))
                .map(this::toEventResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long id) { return toEventResponse(findEvent(id)); }

    @Transactional
    public EventResponse createEvent(EventRequest request, String email) {
        Event event = new Event();
        applyRequest(event, request);
        event.setCreatedBy(findUser(email));
        return toEventResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = findEvent(id);
        if (request.maximumParticipants() < event.getRegisteredParticipants()) {
            throw new ApiException("Maximum participants cannot be lower than current registrations");
        }
        applyRequest(event, request);
        return toEventResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id) { eventRepository.delete(findEvent(id)); }

    @Transactional
    public RegistrationResponse register(Long eventId, String email) {
        User student = findUser(email);
        Event event = eventRepository.findLockedById(eventId).orElseThrow(() -> new ApiException("Event not found"));
        if (event.getEventDate().isBefore(LocalDate.now())) throw new ApiException("Registration is closed for past events");
        if (registrationRepository.existsByEventIdAndStudentId(eventId, student.getId())) throw new ApiException("You are already registered for this event");
        if (event.getRegisteredParticipants() >= event.getMaximumParticipants()) throw new ApiException("This event has reached its participant limit");
        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setStudent(student);
        event.setRegisteredParticipants(event.getRegisteredParticipants() + 1);
        eventRepository.save(event);
        return toRegistrationResponse(registrationRepository.save(registration));
    }

    @Transactional
    public void cancelRegistration(Long eventId, String email) {
        User student = findUser(email);
        Event event = eventRepository.findLockedById(eventId).orElseThrow(() -> new ApiException("Event not found"));
        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
                .orElseThrow(() -> new ApiException("Registration not found"));
        registrationRepository.delete(registration);
        event.setRegisteredParticipants(Math.max(0, event.getRegisteredParticipants() - 1));
        eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> myRegistrations(String email) {
        User student = findUser(email);
        return registrationRepository.findAllByStudentIdOrderByRegisteredAtDesc(student.getId()).stream().map(this::toRegistrationResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> allRegistrations() {
        return registrationRepository.findAllByOrderByRegisteredAtDesc().stream().map(this::toRegistrationResponse).toList();
    }

    @Transactional
    public void adminCancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId).orElseThrow(() -> new ApiException("Registration not found"));
        Event event = eventRepository.findLockedById(registration.getEvent().getId()).orElseThrow(() -> new ApiException("Event not found"));
        registrationRepository.delete(registration);
        event.setRegisteredParticipants(Math.max(0, event.getRegisteredParticipants() - 1));
        eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(eventRepository.count(), eventRepository.countByEventDateGreaterThanEqual(LocalDate.now()),
                registrationRepository.count(), userRepository.countByRole("STUDENT"));
    }

    private Event findEvent(Long id) { return eventRepository.findById(id).orElseThrow(() -> new ApiException("Event not found")); }
    private User findUser(String email) { return userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found")); }

    private void applyRequest(Event event, EventRequest request) {
        if (request.eventDate().isBefore(LocalDate.now())) throw new ApiException("Event date cannot be in the past");
        event.setName(request.name().trim());
        event.setDescription(request.description().trim());
        event.setEventDate(request.eventDate());
        event.setEventTime(request.eventTime());
        event.setVenue(request.venue().trim());
        event.setCategory(request.category().trim());
        event.setMaximumParticipants(request.maximumParticipants());
    }

    private EventResponse toEventResponse(Event event) {
        return new EventResponse(event.getId(), event.getName(), event.getDescription(), event.getEventDate(), event.getEventTime(),
                event.getVenue(), event.getCategory(), event.getMaximumParticipants(), event.getRegisteredParticipants(), event.getCreatedAt());
    }

    private RegistrationResponse toRegistrationResponse(Registration registration) {
        Event event = registration.getEvent();
        User student = registration.getStudent();
        return new RegistrationResponse(registration.getId(), event.getId(), event.getName(), event.getCategory(), event.getVenue(),
                event.getEventDate(), event.getEventTime(), student.getId(), student.getName(), student.getEmail(), student.getPhone(), registration.getRegisteredAt());
    }
}