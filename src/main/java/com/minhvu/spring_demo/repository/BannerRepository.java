package com.minhvu.spring_demo.repository;

import com.minhvu.spring_demo.entity.Banner;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByStatus(Boolean status, Sort sort);
}
