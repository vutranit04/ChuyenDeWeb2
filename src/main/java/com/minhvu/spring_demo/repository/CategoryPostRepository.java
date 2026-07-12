package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.CategoryPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryPostRepository extends JpaRepository<CategoryPost, Long> {
}
