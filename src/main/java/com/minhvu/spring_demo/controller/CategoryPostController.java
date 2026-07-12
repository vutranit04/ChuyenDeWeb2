package com.minhvu.spring_demo.controller;

import com.minhvu.spring_demo.entity.CategoryPost;
import com.minhvu.spring_demo.service.CategoryPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category-posts")
public class CategoryPostController {

    private final CategoryPostService categoryPostService;

    public CategoryPostController(CategoryPostService categoryPostService) {
        this.categoryPostService = categoryPostService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryPost>> getAllCategoryPosts() {
        return ResponseEntity.ok(categoryPostService.getAllCategoryPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryPost> getCategoryPostById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryPostService.getCategoryPostById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryPost> createCategoryPost(@RequestBody CategoryPost categoryPost) {
        return ResponseEntity.ok(categoryPostService.createCategoryPost(categoryPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryPost> updateCategoryPost(@PathVariable Long id, @RequestBody CategoryPost categoryPost) {
        return ResponseEntity.ok(categoryPostService.updateCategoryPost(id, categoryPost));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCategoryPost(@PathVariable Long id) {
        categoryPostService.deleteCategoryPost(id);
        return ResponseEntity.ok(Map.of("message", "Xóa danh mục bài viết thành công"));
    }
}
