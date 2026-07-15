package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
    List<Order> findByCustomerCustomerId(Long customerId);
    List<Order> findByStatusOrderByOrderDateDesc(String status);
    List<Order> findAllByOrderByOrderDateDesc();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'Đã giao'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT MONTH(o.orderDate), COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o WHERE o.status = 'Đã giao' AND YEAR(o.orderDate) = :year " +
           "GROUP BY MONTH(o.orderDate) ORDER BY MONTH(o.orderDate)")
    List<Object[]> revenueByMonth(@Param("year") int year);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    List<Order> findTop5ByOrderByOrderDateDesc();
}
