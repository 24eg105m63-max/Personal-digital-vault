package com.digitalvault.repository;

import com.digitalvault.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByEventIdAndStudentId(Long eventId, Long studentId);
    Optional<Registration> findByEventIdAndStudentId(Long eventId, Long studentId);
    List<Registration> findAllByStudentIdOrderByRegisteredAtDesc(Long studentId);
    List<Registration> findAllByOrderByRegisteredAtDesc();
    long countByStudentRole(String role);
}