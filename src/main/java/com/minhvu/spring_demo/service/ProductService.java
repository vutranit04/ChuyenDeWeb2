package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.Category;
import com.minhvu.spring_demo.entity.Product;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CategoryRepository;
import com.minhvu.spring_demo.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> getAllProducts() {
        Sort sort = Sort.by("productId").descending();
        return productRepository.findAll(sort);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public Product createProduct(Product product) {
        if (product.getProductId() != null) {
            if (product.getProductId() <= 0) {
                product.setProductId(null);
            } else if (productRepository.existsById(product.getProductId())) {
                throw new IllegalArgumentException("Mã sản phẩm (ID: " + product.getProductId() + ") đã tồn tại!");
            }
        }
        Long catId = product.getCategoryId();
        if (catId == null && product.getCategory() != null) {
            catId = product.getCategory().getCategoryId();
        }
        if (catId != null) {
            Category category = categoryRepository.findById(catId)
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

        Long catId = productDetails.getCategoryId();
        if (catId == null && productDetails.getCategory() != null) {
            catId = productDetails.getCategory().getCategoryId();
        }
        if (catId != null) {
            Category category = categoryRepository.findById(catId)
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

    public List<Product> getLatestProducts() {
        return productRepository.findTop8ByStatusOrderByProductIdDesc(true);
    }

    public List<Product> getBestSellers() {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(0, 8);
        List<Product> sellers = productRepository.findBestSellers(pageRequest);
        if (sellers.size() < 8) {
            List<Product> activeProducts = productRepository.findByStatus(true, Sort.by("productId").descending());
            for (Product p : activeProducts) {
                if (sellers.size() >= 8) break;
                if (!sellers.stream().anyMatch(existing -> existing.getProductId().equals(p.getProductId()))) {
                    sellers.add(p);
                }
            }
        }
        return sellers;
    }
}
