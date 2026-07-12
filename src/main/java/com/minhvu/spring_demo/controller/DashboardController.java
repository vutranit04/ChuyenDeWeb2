package com.minhvu.spring_demo.controller;

import com.minhvu.spring_demo.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByMonth() {
        return ResponseEntity.ok(dashboardService.getRevenueByMonth());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        return ResponseEntity.ok(dashboardService.getTopProducts());
    }

    @GetMapping("/order-status")
    public ResponseEntity<List<Map<String, Object>>> getOrderStatusStats() {
        return ResponseEntity.ok(dashboardService.getOrderStatusStats());
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders());
    }
}
