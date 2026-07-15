package com.minhvu.spring_demo.controller;

import com.minhvu.spring_demo.dto.*;
import com.minhvu.spring_demo.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
                orderService.getAllOrders(status)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long id, @RequestBody OrderDTO orderDTO) {
        return ResponseEntity.ok(orderService.updateOrder(id, orderDTO));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "Xóa đơn hàng thành công"));
    }

    // Order Detail endpoints
    @GetMapping("/{orderId}/details")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetails(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetails(orderId));
    }

    @PostMapping("/{orderId}/details")
    public ResponseEntity<OrderDetailDTO> addOrderDetail(
            @PathVariable Long orderId,
            @RequestBody OrderDetailDTO dto) {
        return ResponseEntity.ok(orderService.addOrderDetail(orderId, dto));
    }

    @PutMapping("/{orderId}/details/{id}")
    public ResponseEntity<OrderDetailDTO> updateOrderDetail(
            @PathVariable Long orderId,
            @PathVariable Long id,
            @RequestBody OrderDetailDTO dto) {
        return ResponseEntity.ok(orderService.updateOrderDetail(orderId, id, dto));
    }

    @DeleteMapping("/{orderId}/details/{id}")
    public ResponseEntity<Map<String, String>> deleteOrderDetail(
            @PathVariable Long orderId,
            @PathVariable Long id) {
        orderService.deleteOrderDetail(orderId, id);
        return ResponseEntity.ok(Map.of("message", "Xóa chi tiết đơn hàng thành công"));
    }
}
