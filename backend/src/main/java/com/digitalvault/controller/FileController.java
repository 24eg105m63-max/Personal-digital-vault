package com.digitalvault.controller;

import com.digitalvault.dto.FileUploadResponse;
import com.digitalvault.dto.RenameFileRequest;
import com.digitalvault.dto.VaultFileResponse;
import com.digitalvault.entity.VaultFile;
import com.digitalvault.service.VaultFileService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ContentDisposition;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.List;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class FileController {

    private final VaultFileService vaultFileService;

    public FileController(VaultFileService vaultFileService) {
        this.vaultFileService = vaultFileService;
    }

    @GetMapping("/files")
    public ResponseEntity<List<VaultFileResponse>> getFiles(Authentication authentication,
                                                    @RequestParam(required = false) String q) {
        List<VaultFile> files = q != null && !q.isBlank()
                ? vaultFileService.searchFilesForUser(authentication.getName(), q)
                : vaultFileService.getFilesForUser(authentication.getName());
        return ResponseEntity.ok(files.stream().map(FileController::toResponse).toList());
    }

    @PostMapping(value = "/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadFile(Authentication authentication,
                                                       @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vaultFileService.uploadFile(authentication.getName(), file));
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<Resource> downloadFile(Authentication authentication, @PathVariable Long id) {
        VaultFile vaultFile = vaultFileService.getFileForUser(authentication.getName(), id);
        byte[] data = vaultFileService.downloadFile(authentication.getName(), id);
        ByteArrayResource resource = new ByteArrayResource(data);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(vaultFile.getOriginalFileName(), StandardCharsets.UTF_8).build().toString())
                .contentType(MediaType.parseMediaType(vaultFile.getContentType()))
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping("/files/{id}/preview")
    public ResponseEntity<Resource> previewFile(Authentication authentication, @PathVariable Long id) {
        VaultFile file = vaultFileService.getFileForUser(authentication.getName(), id);
        byte[] data = vaultFileService.downloadFile(authentication.getName(), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(file.getOriginalFileName(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .contentLength(data.length)
                .body(new ByteArrayResource(data));
    }

    @PutMapping("/files/{id}")
    public ResponseEntity<VaultFileResponse> renameFile(Authentication authentication, @PathVariable Long id,
                                                       @Valid @RequestBody RenameFileRequest request) {
        return ResponseEntity.ok(toResponse(vaultFileService.renameFile(authentication.getName(), id, request.name())));
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<Void> deleteFile(Authentication authentication, @PathVariable Long id) {
        vaultFileService.deleteFile(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    private static VaultFileResponse toResponse(VaultFile file) {
        return new VaultFileResponse(file.getId(), file.getOriginalFileName(), file.getContentType(), file.getFileSize(), file.getUploadedAt());
    }
}
