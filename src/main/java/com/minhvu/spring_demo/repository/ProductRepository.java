package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByStatus(Boolean status, Pageable pageable);
    Page<Product> findByCategoryCategoryIdAndStatus(Long categoryId, Boolean status, Pageable pageable);
}
