package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Category;
import com.minhvu.spring_demo.entity.Product;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CategoryRepository;
import com.minhvu.spring_demo.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<Product> getAllProducts(Long categoryId, Boolean status, Pageable pageable) {
        if (categoryId != null && status != null) {
            return productRepository.findByCategoryCategoryIdAndStatus(categoryId, status, pageable);
        } else if (categoryId != null) {
            return productRepository.findByCategoryCategoryId(categoryId, pageable);
        } else if (status != null) {
            return productRepository.findByStatus(status, pageable);
        }
        return productRepository.findAll(pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public Product createProduct(Product product) {
        if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        if (productDetails.getProductName() != null) product.setProductName(productDetails.getProductName());
        if (productDetails.getImage() != null) product.setImage(productDetails.getImage());
        if (productDetails.getPrice() != null) product.setPrice(productDetails.getPrice());
        if (productDetails.getStockQuantity() != null) product.setStockQuantity(productDetails.getStockQuantity());
        if (productDetails.getSpecifications() != null) product.setSpecifications(productDetails.getSpecifications());
        if (productDetails.getDescription() != null) product.setDescription(productDetails.getDescription());
        if (productDetails.getStatus() != null) product.setStatus(productDetails.getStatus());
        if (productDetails.getCategory() != null && productDetails.getCategory().getCategoryId() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setStatus(false);
        productRepository.save(product);
    }
}
