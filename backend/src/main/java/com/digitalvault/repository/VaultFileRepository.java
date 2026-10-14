package com.digitalvault.repository;

import com.digitalvault.entity.User;
import com.digitalvault.entity.VaultFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VaultFileRepository extends JpaRepository<VaultFile, Long> {
    List<VaultFile> findByUserOrderByUploadedAtDesc(User user);
    Optional<VaultFile> findByIdAndUser(Long id, User user);
    long countByUser(User user);

    @Query("SELECT f FROM VaultFile f WHERE f.user = :user AND LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY f.uploadedAt DESC")
    List<VaultFile> searchByUserAndKeyword(@Param("user") User user, @Param("keyword") String keyword);
}
