package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Category category;

    @Transient
    @JsonProperty(value = "categoryId", access = JsonProperty.Access.WRITE_ONLY)
    @Schema(description = "Mã danh mục", example = "1")
    private Long categoryId;

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
