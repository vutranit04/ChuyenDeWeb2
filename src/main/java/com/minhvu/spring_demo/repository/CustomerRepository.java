package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);
    Page<Customer> findByPhoneContaining(String phone, Pageable pageable);
}
