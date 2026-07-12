package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.CategoryPost;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CategoryPostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryPostService {

    private final CategoryPostRepository categoryPostRepository;

    public CategoryPostService(CategoryPostRepository categoryPostRepository) {
        this.categoryPostRepository = categoryPostRepository;
    }

    public List<CategoryPost> getAllCategoryPosts() {
        return categoryPostRepository.findAll();
    }

    public CategoryPost getCategoryPostById(Long id) {
        return categoryPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục bài viết với ID: " + id));
    }

    public CategoryPost createCategoryPost(CategoryPost categoryPost) {
        return categoryPostRepository.save(categoryPost);
    }

    public CategoryPost updateCategoryPost(Long id, CategoryPost details) {
        CategoryPost categoryPost = getCategoryPostById(id);
        if (details.getCategoryPostName() != null) categoryPost.setCategoryPostName(details.getCategoryPostName());
        if (details.getDescription() != null) categoryPost.setDescription(details.getDescription());
        return categoryPostRepository.save(categoryPost);
    }

    public void deleteCategoryPost(Long id) {
        if (!categoryPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục bài viết với ID: " + id);
        }
        categoryPostRepository.deleteById(id);
    }
}
