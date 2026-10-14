package com.digitalvault.controller;

import com.digitalvault.dto.EventRequest;
import com.digitalvault.dto.EventResponse;
import com.digitalvault.dto.RegistrationResponse;
import com.digitalvault.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping
    public List<EventResponse> list(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) String category,
                                    @RequestParam(defaultValue = "false") boolean upcoming) {
        return eventService.listEvents(search, category, upcoming);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) { return eventService.getEvent(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody EventRequest request, Authentication authentication) {
        return eventService.createEvent(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request) { return eventService.updateEvent(id, request); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { eventService.deleteEvent(id); }

    @PostMapping("/{id}/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse register(@PathVariable Long id, Authentication authentication) { return eventService.register(id, authentication.getName()); }

    @DeleteMapping("/{id}/register")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id, Authentication authentication) { eventService.cancelRegistration(id, authentication.getName()); }
}
