package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 150, nullable = false)
    private String productName;

    @Column(length = 255)
    private String image;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "BIT DEFAULT 1")
    private Boolean status = true;
}
