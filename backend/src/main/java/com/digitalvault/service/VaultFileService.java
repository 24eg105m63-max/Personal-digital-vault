package com.digitalvault.service;

import com.digitalvault.dto.FileUploadResponse;
import com.digitalvault.entity.User;
import com.digitalvault.entity.VaultFile;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.UserRepository;
import com.digitalvault.repository.VaultFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class VaultFileService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    private final VaultFileRepository vaultFileRepository;
    private final UserRepository userRepository;

    public VaultFileService(VaultFileRepository vaultFileRepository, UserRepository userRepository) {
        this.vaultFileRepository = vaultFileRepository;
        this.userRepository = userRepository;
    }

    public List<VaultFile> getFilesForUser(String email) {
        User user = getUserByEmail(email);
        return vaultFileRepository.findByUserOrderByUploadedAtDesc(user);
    }

    public List<VaultFile> searchFilesForUser(String email, String keyword) {
        User user = getUserByEmail(email);
        if (keyword == null || keyword.trim().isEmpty()) {
            return vaultFileRepository.findByUserOrderByUploadedAtDesc(user);
        }
        return vaultFileRepository.searchByUserAndKeyword(user, keyword.trim());
    }

    public FileUploadResponse uploadFile(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException("File size exceeds 20 MB limit");
        }

        User user = getUserByEmail(email);
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new ApiException("Original file name is required");
        }

        String extension = "";
        int lastDot = originalFileName.lastIndexOf('.');
        if (lastDot > 0) {
            extension = originalFileName.substring(lastDot);
        }

        String storedFileName = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            VaultFile vaultFile = new VaultFile();
            vaultFile.setUser(user);
            vaultFile.setOriginalFileName(originalFileName);
            vaultFile.setStoredFileName(storedFileName);
            vaultFile.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            vaultFile.setFileSize(file.getSize());

            VaultFile saved = vaultFileRepository.save(vaultFile);
            return new FileUploadResponse(saved.getId(), saved.getOriginalFileName(), saved.getStoredFileName(), saved.getContentType(), saved.getFileSize());
        } catch (IOException e) {
            throw new ApiException("Could not store file");
        }
    }

    public byte[] downloadFile(String email, Long id) {
        User user = getUserByEmail(email);
        VaultFile vaultFile = vaultFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException("File not found or access denied"));

        try {
            Path path = Paths.get(uploadDir).resolve(vaultFile.getStoredFileName());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new ApiException("Could not download file");
        }
    }

    public void deleteFile(String email, Long id) {
        User user = getUserByEmail(email);
        VaultFile vaultFile = vaultFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException("File not found or access denied"));

        try {
            Path path = Paths.get(uploadDir).resolve(vaultFile.getStoredFileName());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new ApiException("Could not delete file from storage");
        }

        vaultFileRepository.delete(vaultFile);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }
}
