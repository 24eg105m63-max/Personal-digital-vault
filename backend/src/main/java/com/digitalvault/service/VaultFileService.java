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
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class VaultFileService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "xls", "xlsx");

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
        String suppliedName = file.getOriginalFilename();
        if (suppliedName == null || suppliedName.isBlank()) {
            throw new ApiException("Original file name is required");
        }
        String originalFileName = Paths.get(suppliedName.replace('\\', '/')).getFileName().toString().replaceAll("[\\p{Cntrl}]", "").trim();
        if (originalFileName.isBlank() || originalFileName.length() > 255) throw new ApiException("File name is invalid");
        int lastDot = originalFileName.lastIndexOf('.');
        String type = lastDot > 0 ? originalFileName.substring(lastDot + 1).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_TYPES.contains(type)) throw new ApiException("This file type is not supported");
        String extension = "." + type;

        String storedFileName = UUID.randomUUID() + extension;
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            byte[] content = file.getBytes();
            validateFileContent(type, content);
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(storedFileName);
            Files.write(destination, content, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);

            VaultFile vaultFile = new VaultFile();
            vaultFile.setUser(user);
            vaultFile.setOriginalFileName(originalFileName);
            vaultFile.setStoredFileName(storedFileName);
            vaultFile.setContentType(contentTypeFor(type));
            vaultFile.setFileSize(file.getSize());

            VaultFile saved = vaultFileRepository.save(vaultFile);
            return new FileUploadResponse(saved.getId(), saved.getOriginalFileName(), saved.getStoredFileName(), saved.getContentType(), saved.getFileSize());
        } catch (IOException e) {
            throw new ApiException("Could not store file");
        }
    }

    public VaultFile getFileForUser(String email, Long id) {
        User user = getUserByEmail(email);
        return vaultFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "File not found or access denied"));
    }

    public VaultFile renameFile(String email, Long id, String name) {
        VaultFile vaultFile = getFileForUser(email, id);
        String cleanName = name.trim().replaceAll("[\\p{Cntrl}]", "");
        if (cleanName.isBlank() || cleanName.length() > 255 || cleanName.contains("/") || cleanName.contains("\\")) {
            throw new ApiException("File name is invalid");
        }
        vaultFile.setOriginalFileName(cleanName);
        return vaultFileRepository.save(vaultFile);
    }

    public byte[] downloadFile(String email, Long id) {
        User user = getUserByEmail(email);
        VaultFile vaultFile = vaultFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "File not found or access denied"));

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path path = root.resolve(vaultFile.getStoredFileName()).normalize();
            if (!path.startsWith(root)) throw new ApiException("File not found");
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new ApiException("Could not download file");
        }
    }

    public void deleteFile(String email, Long id) {
        User user = getUserByEmail(email);
        VaultFile vaultFile = vaultFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "File not found or access denied"));

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path path = root.resolve(vaultFile.getStoredFileName()).normalize();
            if (!path.startsWith(root)) throw new ApiException("File not found");
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new ApiException("Could not delete file from storage");
        }

        vaultFileRepository.delete(vaultFile);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
    }

    private String contentTypeFor(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "txt" -> "text/plain";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> "application/octet-stream";
        };
    }

    private void validateFileContent(String type, byte[] content) {
        boolean valid = switch (type) {
            case "pdf" -> startsWith(content, new byte[]{'%', 'P', 'D', 'F', '-'});
            case "png" -> startsWith(content, new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10});
            case "jpg", "jpeg" -> startsWith(content, new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff});
            case "doc", "xls" -> startsWith(content, new byte[]{(byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0});
            case "docx", "xlsx" -> startsWith(content, new byte[]{'P', 'K', 3, 4});
            case "txt" -> isPlainText(content);
            default -> false;
        };
        if (!valid) throw new ApiException("The file content does not match its supported file type");
    }

    private boolean startsWith(byte[] content, byte[] signature) {
        if (content.length < signature.length) return false;
        for (int i = 0; i < signature.length; i++) if (content[i] != signature[i]) return false;
        return true;
    }

    private boolean isPlainText(byte[] content) {
        if (content.length == 0) return false;
        for (byte value : content) if (value == 0) return false;
        return true;
    }
}
