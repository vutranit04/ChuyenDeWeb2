package com.minhvu.spring_demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabasePostFixRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabasePostFixRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== RUNNING DATABASE MIGRATION TO FIX POSTS TABLE ===");
        try {
            // Check if column category_id exists in table 'posts' first to avoid running redundant drops
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'category_id'",
                Integer.class
            );

            if (count != null && count > 0) {
                System.out.println("Column posts.category_id found. Proceeding with migration...");
                
                // Attempt to drop foreign key constraint first
                try {
                    jdbcTemplate.execute("ALTER TABLE posts DROP FOREIGN KEY FKijnwr3brs8vaosl80jg9rp7uc");
                    System.out.println("Successfully dropped foreign key constraint FKijnwr3brs8vaosl80jg9rp7uc");
                } catch (Exception fkEx) {
                    System.out.println("Foreign key constraint drop failed or already dropped: " + fkEx.getMessage());
                }
                
                // Now attempt to drop the orphan category_id column
                jdbcTemplate.execute("ALTER TABLE posts DROP COLUMN category_id");
                System.out.println("Successfully dropped orphan column posts.category_id");
            } else {
                System.out.println("posts.category_id column has already been dropped. No migration needed.");
            }
        } catch (Exception e) {
            System.out.println("Database migration failed: " + e.getMessage());
        }
        System.out.println("=== DATABASE POSTS MIGRATION COMPLETED ===");
    }
}
