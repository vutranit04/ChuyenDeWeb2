package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Banner;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.BannerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> getAllBanners() {
        Sort sort = Sort.by("createdAt").descending();
        return bannerRepository.findAll(sort);
    }

    public List<Banner> getActiveBanners() {
        Sort sort = Sort.by("createdAt").descending();
        return bannerRepository.findByStatus(true, sort);
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với ID: " + id));
    }

    public Banner createBanner(Banner banner) {
        if (banner.getBannerId() != null) {
            if (banner.getBannerId() <= 0) {
                banner.setBannerId(null);
            } else if (bannerRepository.existsById(banner.getBannerId())) {
                throw new IllegalArgumentException("Mã banner (ID: " + banner.getBannerId() + ") đã tồn tại!");
            }
        }
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner banner = getBannerById(id);
        if (bannerDetails.getTitle() != null) banner.setTitle(bannerDetails.getTitle());
        if (bannerDetails.getImageUrl() != null) banner.setImageUrl(bannerDetails.getImageUrl());
        if (bannerDetails.getLinkUrl() != null) banner.setLinkUrl(bannerDetails.getLinkUrl());
        if (bannerDetails.getStatus() != null) banner.setStatus(bannerDetails.getStatus());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy banner với ID: " + id);
        }
        bannerRepository.deleteById(id);
    }
}
