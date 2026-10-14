package com.digitalvault.service;

import com.digitalvault.dto.NoteRequest;
import com.digitalvault.dto.NoteResponse;
import com.digitalvault.entity.Note;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.NoteRepository;
import com.digitalvault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    public List<NoteResponse> getNotesForUser(String email) {
        User user = getUserByEmail(email);
        return noteRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(note -> new NoteResponse(
                        note.getId(),
                        note.getTitle(),
                        note.getContent(),
                        note.getCreatedAt(),
                        note.getUpdatedAt()
                ))
                .toList();
    }

    public NoteResponse createNote(String email, NoteRequest request) {
        User user = getUserByEmail(email);
        Note note = new Note();
        note.setUser(user);
        note.setTitle(request.getTitle().trim());
        note.setContent(request.getContent().trim());
        Note saved = noteRepository.save(note);
        return new NoteResponse(saved.getId(), saved.getTitle(), saved.getContent(), saved.getCreatedAt(), saved.getUpdatedAt());
    }

    public NoteResponse updateNote(String email, Long id, NoteRequest request) {
        User user = getUserByEmail(email);
        Note note = noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException("Note not found or access denied"));
        note.setTitle(request.getTitle().trim());
        note.setContent(request.getContent().trim());
        Note saved = noteRepository.save(note);
        return new NoteResponse(saved.getId(), saved.getTitle(), saved.getContent(), saved.getCreatedAt(), saved.getUpdatedAt());
    }

    public void deleteNote(String email, Long id) {
        User user = getUserByEmail(email);
        Note note = noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException("Note not found or access denied"));
        noteRepository.delete(note);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }
}
