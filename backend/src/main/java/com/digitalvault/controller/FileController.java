package com.digitalvault.controller;

import com.digitalvault.dto.FileUploadResponse;
import com.digitalvault.entity.VaultFile;
import com.digitalvault.service.VaultFileService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FileController {

    private final VaultFileService vaultFileService;

    public FileController(VaultFileService vaultFileService) {
        this.vaultFileService = vaultFileService;
    }

    @GetMapping("/files")
    public ResponseEntity<List<VaultFile>> getFiles(Authentication authentication,
                                                    @RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(vaultFileService.searchFilesForUser(authentication.getName(), q));
        }
        return ResponseEntity.ok(vaultFileService.getFilesForUser(authentication.getName()));
    }

    @PostMapping(value = "/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadFile(Authentication authentication,
                                                       @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(vaultFileService.uploadFile(authentication.getName(), file));
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<Resource> downloadFile(Authentication authentication, @PathVariable Long id) {
        VaultFile vaultFile = vaultFileService.getFilesForUser(authentication.getName()).stream()
                .filter(file -> file.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File not found or access denied"));

        byte[] data = vaultFileService.downloadFile(authentication.getName(), id);
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + vaultFile.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(vaultFile.getContentType()))
                .contentLength(data.length)
                .body(resource);
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<Void> deleteFile(Authentication authentication, @PathVariable Long id) {
        vaultFileService.deleteFile(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
