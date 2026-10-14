package com.digitalvault.controller;

import com.digitalvault.dto.NoteRequest;
import com.digitalvault.dto.NoteResponse;
import com.digitalvault.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/notes")
    public ResponseEntity<List<NoteResponse>> getNotes(Authentication authentication) {
        return ResponseEntity.ok(noteService.getNotesForUser(authentication.getName()));
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteResponse> createNote(Authentication authentication, @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(authentication.getName(), request));
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteResponse> updateNote(Authentication authentication,
                                                @PathVariable Long id,
                                                @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.ok(noteService.updateNote(authentication.getName(), id, request));
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(Authentication authentication, @PathVariable Long id) {
        noteService.deleteNote(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
