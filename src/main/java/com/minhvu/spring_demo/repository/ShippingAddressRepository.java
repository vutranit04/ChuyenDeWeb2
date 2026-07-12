package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByCustomerCustomerId(Long customerId);
}
