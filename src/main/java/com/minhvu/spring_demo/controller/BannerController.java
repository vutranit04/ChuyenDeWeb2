package com.minhvu.spring_demo.controller;

import com.minhvu.spring_demo.entity.Banner;
import com.minhvu.spring_demo.service.BannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners(@RequestParam(value = "activeOnly", required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(bannerService.getActiveBanners());
        }
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.getBannerById(id));
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.createBanner(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(Map.of("message", "Xóa banner thành công"));
    }
}
