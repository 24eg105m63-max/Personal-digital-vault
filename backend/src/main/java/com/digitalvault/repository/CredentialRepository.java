package com.digitalvault.repository;

import com.digitalvault.entity.Credential;
import com.digitalvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CredentialRepository extends JpaRepository<Credential, Long> {
    List<Credential> findByUserOrderByCreatedAtDesc(User user);
    Optional<Credential> findByIdAndUser(Long id, User user);
    long countByUser(User user);
}
