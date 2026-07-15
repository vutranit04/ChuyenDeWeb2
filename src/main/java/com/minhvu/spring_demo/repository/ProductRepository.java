package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryCategoryId(Long categoryId, Sort sort);
    List<Product> findByStatus(Boolean status, Sort sort);
    List<Product> findByCategoryCategoryIdAndStatus(Long categoryId, Boolean status, Sort sort);

    List<Product> findTop8ByStatusOrderByProductIdDesc(Boolean status);

    @Query("SELECT od.product FROM OrderDetail od GROUP BY od.product ORDER BY SUM(od.quantity) DESC")
    List<Product> findBestSellers(Pageable pageable);
}
