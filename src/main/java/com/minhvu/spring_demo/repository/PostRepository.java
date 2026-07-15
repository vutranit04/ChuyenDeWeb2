package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Post;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCategoryPostCategoryPostId(Long categoryPostId, Sort sort);
    List<Post> findByStatus(Boolean status, Sort sort);
}
