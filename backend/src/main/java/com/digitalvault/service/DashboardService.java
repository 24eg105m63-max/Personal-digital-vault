package com.digitalvault.service;

import com.digitalvault.dto.DashboardResponse;
import com.digitalvault.dto.AdminVaultStatsResponse;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.CredentialRepository;
import com.digitalvault.repository.NoteRepository;
import com.digitalvault.repository.UserRepository;
import com.digitalvault.repository.VaultFileRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final VaultFileRepository vaultFileRepository;
    private final NoteRepository noteRepository;
    private final CredentialRepository credentialRepository;

    public DashboardService(UserRepository userRepository,
                           VaultFileRepository vaultFileRepository,
                           NoteRepository noteRepository,
                           CredentialRepository credentialRepository) {
        this.userRepository = userRepository;
        this.vaultFileRepository = vaultFileRepository;
        this.noteRepository = noteRepository;
        this.credentialRepository = credentialRepository;
    }

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        long fileCount = vaultFileRepository.countByUser(user);
        long noteCount = noteRepository.countByUser(user);
        long credentialCount = credentialRepository.countByUser(user);

        return new DashboardResponse(user.getName(), user.getEmail(), fileCount, noteCount, credentialCount);
    }

    public AdminVaultStatsResponse getAdminStats() {
        return new AdminVaultStatsResponse(userRepository.count(), vaultFileRepository.count(),
                noteRepository.count(), credentialRepository.count());
    }
}
