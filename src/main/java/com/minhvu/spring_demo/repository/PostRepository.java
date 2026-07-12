package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategoryPostCategoryPostId(Long categoryPostId, Pageable pageable);
    Page<Post> findByStatus(Boolean status, Pageable pageable);
}
