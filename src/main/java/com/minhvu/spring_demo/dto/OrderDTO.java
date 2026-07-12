package com.minhvu.spring_demo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private Long addressId;
    private String shippingAddress;
    private String status;
    private String note;
    private List<OrderDetailDTO> orderDetails;
}
