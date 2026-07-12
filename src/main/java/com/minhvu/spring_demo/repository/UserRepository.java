package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Page<User> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);
    Page<User> findByRole(String role, Pageable pageable);
    Page<User> findByFullNameContainingIgnoreCaseAndRole(String fullName, String role, Pageable pageable);
}
