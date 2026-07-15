package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.dto.*;
import com.minhvu.spring_demo.entity.*;
import com.minhvu.spring_demo.exception.InsufficientStockException;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ShippingAddressRepository addressRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderDetailRepository orderDetailRepository,
                        ProductRepository productRepository,
                        CustomerRepository customerRepository,
                        ShippingAddressRepository addressRepository) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
    }

    public List<OrderDTO> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatusOrderByOrderDateDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByOrderDateDesc();
        }
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        OrderDTO dto = toDTO(order);
        // Include order details
        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(id);
        dto.setOrderDetails(details.stream().map(this::toDetailDTO).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        ShippingAddress address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng"));

        Order order = Order.builder()
                .customer(customer)
                .shippingAddress(address)
                .note(request.getNote())
                .totalAmount(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + item.getProductId()));

            // Check stock
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        "Sản phẩm '" + product.getProductName() + "' chỉ còn " + product.getStockQuantity() + " trong kho");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            // Calculate line total
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .totalPrice(lineTotal)
                    .description(item.getDescription())
                    .build();
            details.add(orderDetailRepository.save(detail));
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        OrderDTO dto = toDTO(order);
        dto.setOrderDetails(details.stream().map(this::toDetailDTO).collect(Collectors.toList()));
        return dto;
    }

    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        if (orderDTO.getAddressId() != null) {
            ShippingAddress address = addressRepository.findById(orderDTO.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng"));
            order.setShippingAddress(address);
        } else if (orderDTO.getShippingAddress() != null && !orderDTO.getShippingAddress().isEmpty()) {
            ShippingAddress address = order.getShippingAddress();
            if (address != null) {
                address.setSpecificAddress(orderDTO.getShippingAddress());
                addressRepository.save(address);
            }
        }
        if (orderDTO.getNote() != null) order.setNote(orderDTO.getNote());

        order = orderRepository.save(order);
        return toDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        String oldStatus = order.getStatus();

        // If cancelling an order, restore stock
        if ("Đã hủy".equals(newStatus) && !"Đã hủy".equals(oldStatus)) {
            List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(id);
            for (OrderDetail detail : details) {
                Product product = detail.getProduct();
                product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);
        return toDTO(order);
    }

    // Order Detail operations
    public List<OrderDetailDTO> getOrderDetails(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId);
        }
        return orderDetailRepository.findByOrderOrderId(orderId)
                .stream().map(this::toDetailDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrderDetailDTO addOrderDetail(Long orderId, OrderDetailDTO dto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        if (product.getStockQuantity() < dto.getQuantity()) {
            throw new InsufficientStockException(
                    "Sản phẩm '" + product.getProductName() + "' chỉ còn " + product.getStockQuantity() + " trong kho");
        }

        product.setStockQuantity(product.getStockQuantity() - dto.getQuantity());
        productRepository.save(product);

        BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(dto.getQuantity()));

        OrderDetail detail = OrderDetail.builder()
                .order(order)
                .product(product)
                .quantity(dto.getQuantity())
                .totalPrice(lineTotal)
                .description(dto.getDescription())
                .build();
        detail = orderDetailRepository.save(detail);

        // Update order total
        order.setTotalAmount(order.getTotalAmount().add(lineTotal));
        orderRepository.save(order);

        return toDetailDTO(detail);
    }

    @Transactional
    public OrderDetailDTO updateOrderDetail(Long orderId, Long detailId, OrderDetailDTO dto) {
        OrderDetail detail = orderDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng"));

        if (dto.getQuantity() != null && !dto.getQuantity().equals(detail.getQuantity())) {
            Product product = detail.getProduct();
            int diff = dto.getQuantity() - detail.getQuantity();

            if (diff > 0 && product.getStockQuantity() < diff) {
                throw new InsufficientStockException(
                        "Sản phẩm '" + product.getProductName() + "' chỉ còn " + product.getStockQuantity() + " trong kho");
            }

            product.setStockQuantity(product.getStockQuantity() - diff);
            productRepository.save(product);

            BigDecimal oldTotal = detail.getTotalPrice();
            BigDecimal newTotal = product.getPrice().multiply(BigDecimal.valueOf(dto.getQuantity()));
            detail.setQuantity(dto.getQuantity());
            detail.setTotalPrice(newTotal);

            // Update order total
            Order order = detail.getOrder();
            order.setTotalAmount(order.getTotalAmount().subtract(oldTotal).add(newTotal));
            orderRepository.save(order);
        }

        if (dto.getDescription() != null) detail.setDescription(dto.getDescription());
        detail = orderDetailRepository.save(detail);
        return toDetailDTO(detail);
    }

    @Transactional
    public void deleteOrderDetail(Long orderId, Long detailId) {
        OrderDetail detail = orderDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng"));

        // Restore stock
        Product product = detail.getProduct();
        product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
        productRepository.save(product);

        // Update order total
        Order order = detail.getOrder();
        order.setTotalAmount(order.getTotalAmount().subtract(detail.getTotalPrice()));
        orderRepository.save(order);

        orderDetailRepository.delete(detail);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        if (!"Đã hủy".equals(order.getStatus())) {
            List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(id);
            for (OrderDetail detail : details) {
                Product product = detail.getProduct();
                product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
                productRepository.save(product);
            }
        }

        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(id);
        orderDetailRepository.deleteAll(details);
        orderRepository.deleteById(id);
    }

    private OrderDTO toDTO(Order order) {
        return OrderDTO.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomer().getCustomerId())
                .customerName(order.getCustomer().getFullName())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .addressId(order.getShippingAddress().getAddressId())
                .shippingAddress(order.getShippingAddress().getSpecificAddress())
                .status(order.getStatus())
                .note(order.getNote())
                .build();
    }

    private OrderDetailDTO toDetailDTO(OrderDetail detail) {
        return OrderDetailDTO.builder()
                .orderDetailId(detail.getOrderDetailId())
                .orderId(detail.getOrder().getOrderId())
                .productId(detail.getProduct().getProductId())
                .productName(detail.getProduct().getProductName())
                .quantity(detail.getQuantity())
                .totalPrice(detail.getTotalPrice())
                .description(detail.getDescription())
                .build();
    }
}
