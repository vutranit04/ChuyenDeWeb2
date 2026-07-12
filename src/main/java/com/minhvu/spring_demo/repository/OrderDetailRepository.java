package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrderOrderId(Long orderId);

    @Query("SELECT od.product.productId, od.product.productName, SUM(od.quantity) as totalQty " +
           "FROM OrderDetail od GROUP BY od.product.productId, od.product.productName " +
           "ORDER BY totalQty DESC")
    List<Object[]> findTopProducts();
}
