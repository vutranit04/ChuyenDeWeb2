package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long bannerId;

    @Column(length = 150)
    private String title;

    @Column(length = 255, nullable = false)
    private String imageUrl;

    @Column(length = 255)
    private String linkUrl;

    @Column(columnDefinition = "BIT DEFAULT 1")
    private Boolean status = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
