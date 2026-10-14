package com.digitalvault.controller;

import com.digitalvault.dto.RegistrationResponse;
import com.digitalvault.dto.AdminStatsResponse;
import com.digitalvault.service.EventService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RegistrationController {
    private final EventService eventService;
    public RegistrationController(EventService eventService) { this.eventService = eventService; }

    @GetMapping("/registrations/my")
    public List<RegistrationResponse> my(Authentication authentication) { return eventService.myRegistrations(authentication.getName()); }

    @GetMapping("/admin/registrations")
    public List<RegistrationResponse> all() { return eventService.allRegistrations(); }

    @DeleteMapping("/admin/registrations/{id}")
    public void cancel(@PathVariable Long id) { eventService.adminCancelRegistration(id); }

    @GetMapping("/admin/stats")
    public AdminStatsResponse stats() { return eventService.stats(); }
}
