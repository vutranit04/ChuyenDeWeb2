package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.repository.CustomerRepository;
import com.minhvu.spring_demo.repository.OrderDetailRepository;
import com.minhvu.spring_demo.repository.OrderRepository;
import com.minhvu.spring_demo.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public DashboardService(OrderRepository orderRepository,
                            OrderDetailRepository orderDetailRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCustomers", customerRepository.count());
        summary.put("totalProducts", productRepository.count());
        summary.put("pendingOrders", orderRepository.countByStatus("Chờ duyệt"));
        summary.put("totalRevenue", orderRepository.sumTotalRevenue());
        return summary;
    }

    public List<Map<String, Object>> getRevenueByMonth() {
        int currentYear = LocalDate.now().getYear();
        List<Object[]> results = orderRepository.revenueByMonth(currentYear);

        // Initialize all 12 months with 0
        Map<Integer, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyRevenue.put(i, BigDecimal.ZERO);
        }

        for (Object[] row : results) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal revenue = (BigDecimal) row[1];
            monthlyRevenue.put(month, revenue);
        }

        return monthlyRevenue.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", entry.getKey());
                    map.put("revenue", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopProducts() {
        List<Object[]> results = orderDetailRepository.findTopProducts();
        return results.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("productId", row[0]);
                    map.put("productName", row[1]);
                    map.put("totalQuantity", row[2]);
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getOrderStatusStats() {
        List<Object[]> results = orderRepository.countOrdersByStatus();
        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("status", row[0]);
                    map.put("count", row[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRecentOrders() {
        return orderRepository.findTop5ByOrderByOrderDateDesc().stream()
                .map(order -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("orderId", order.getOrderId());
                    map.put("customerName", order.getCustomer().getFullName());
                    map.put("orderDate", order.getOrderDate());
                    map.put("totalAmount", order.getTotalAmount());
                    map.put("status", order.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
