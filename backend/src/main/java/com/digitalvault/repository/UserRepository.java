package com.digitalvault.repository;

import com.digitalvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(String role);
    java.util.List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByNameAsc(String name, String email);
    long countByRoleAndActiveTrue(String role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.role = 'ADMIN' and u.active = true order by u.id")
    java.util.List<User> lockActiveAdministrators();
}
