package com.spendix.backend.config;

import com.spendix.backend.entity.Category;
import com.spendix.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // If there are no default categories (where user is null), populate them
        long defaultCount = categoryRepository.findAll().stream()
                .filter(c -> c.getUser() == null)
                .count();

        if (defaultCount == 0) {
            List<Category> defaults = List.of(
                    // Expense categories
                    Category.builder().name("General").icon("💰").color("#c5a059").type("EXPENSE").build(),
                    Category.builder().name("Rent").icon("🏠").color("#c5a059").type("EXPENSE").build(),
                    Category.builder().name("Food").icon("🍔").color("#2d9d5c").type("EXPENSE").build(),
                    Category.builder().name("Transport").icon("🚗").color("#3b82f6").type("EXPENSE").build(),
                    Category.builder().name("Utilities").icon("⚡").color("#6b7280").type("EXPENSE").build(),
                    Category.builder().name("Entertainment").icon("🎬").color("#a855f7").type("EXPENSE").build(),
                    
                    // Income categories
                    Category.builder().name("Salary").icon("💼").color("#2d9d5c").type("INCOME").build(),
                    Category.builder().name("Freelance").icon("💻").color("#2d9d5c").type("INCOME").build(),
                    Category.builder().name("Investment").icon("📈").color("#2d9d5c").type("INCOME").build()
            );

            categoryRepository.saveAll(defaults);
            System.out.println("Initialized " + defaults.size() + " default system categories.");
        }

        // Migrate existing legacy data from string category column to category_id
        try {
            jdbcTemplate.execute("""
                UPDATE expense e 
                JOIN category c ON LOWER(e.category) = LOWER(c.name) 
                SET e.category_id = c.id 
                WHERE e.category_id IS NULL
            """);
            System.out.println("Migrated legacy string categories to Category entities in expense table.");
        } catch (Exception e) {
            // Ignore if column doesn't exist
        }

        try {
            jdbcTemplate.execute("""
                UPDATE income i 
                JOIN category c ON LOWER(i.category) = LOWER(c.name) 
                SET i.category_id = c.id 
                WHERE i.category_id IS NULL
            """);
            System.out.println("Migrated legacy string categories to Category entities in income table.");
        } catch (Exception e) {
            // Ignore if column doesn't exist
        }
    }
}
