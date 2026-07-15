package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByFullNameContainingIgnoreCase(String fullName);
    List<Customer> findByPhoneContaining(String phone);
    boolean existsByEmail(String email);
    Optional<Customer> findByEmail(String email);
}
