package com.digitalvault.controller;

import com.digitalvault.dto.CredentialRequest;
import com.digitalvault.dto.CredentialResponse;
import com.digitalvault.service.CredentialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CredentialController {

    private final CredentialService credentialService;

    public CredentialController(CredentialService credentialService) {
        this.credentialService = credentialService;
    }

    @GetMapping("/credentials")
    public ResponseEntity<List<CredentialResponse>> getCredentials(Authentication authentication) {
        return ResponseEntity.ok(credentialService.getCredentials(authentication.getName()));
    }

    @GetMapping("/credentials/{id}/password")
    public ResponseEntity<java.util.Map<String, String>> revealPassword(Authentication authentication,
                                                                         @PathVariable Long id) {
        return ResponseEntity.ok(java.util.Map.of(
                "password", credentialService.revealPassword(authentication.getName(), id)));
    }

    @PostMapping("/credentials")
    public ResponseEntity<CredentialResponse> createCredential(Authentication authentication,
                                                             @Valid @RequestBody CredentialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(credentialService.createCredential(authentication.getName(), request));
    }

    @PutMapping("/credentials/{id}")
    public ResponseEntity<CredentialResponse> updateCredential(Authentication authentication,
                                                             @PathVariable Long id,
                                                             @Valid @RequestBody CredentialRequest request) {
        return ResponseEntity.ok(credentialService.updateCredential(authentication.getName(), id, request));
    }

    @DeleteMapping("/credentials/{id}")
    public ResponseEntity<Void> deleteCredential(Authentication authentication, @PathVariable Long id) {
        credentialService.deleteCredential(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
