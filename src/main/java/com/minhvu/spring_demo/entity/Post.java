package com.minhvu.spring_demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_post_id", nullable = false)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private CategoryPost categoryPost;

    @Transient
    @JsonProperty(value = "categoryPostId", access = JsonProperty.Access.WRITE_ONLY)
    @Schema(description = "Mã danh mục bài viết", example = "1")
    private Long categoryPostId;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(length = 255, nullable = false)
    private String thumbnail;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private User author;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "BIT DEFAULT 1")
    private Boolean status = true;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
