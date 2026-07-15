package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "shipping_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long addressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(length = 100, nullable = false)
    private String contactName;

    @Column(length = 20, nullable = false)
    private String phone;

    @Column(length = 255, nullable = false)
    private String specificAddress;

    @Column(columnDefinition = "BIT DEFAULT 0")
    private Boolean isDefault = false;
}
