package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryPostId;

    @Column(length = 100, nullable = false)
    private String categoryPostName;

    @Column(length = 255)
    private String description;
}
