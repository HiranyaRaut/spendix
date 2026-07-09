package com.spendix.backend.repository;

import com.spendix.backend.entity.Category;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    @Query("""
            SELECT c FROM Category c 
            WHERE c.user = :user OR c.user IS NULL
            """)
    List<Category> findByUserOrSystem(User user);

    @Query("""
            SELECT c FROM Category c 
            WHERE (c.type = :type OR c.type = 'BOTH')
            AND (c.user = :user OR c.user IS NULL)
            """)
    List<Category> findByTypeAndUserOrSystem(String type, User user);

    @Query("""
            SELECT c FROM Category c 
            WHERE LOWER(c.name) = LOWER(:name)
            AND (c.user = :user OR c.user IS NULL)
            ORDER BY c.user DESC
            """)
    List<Category> findByNameAndUserOrSystem(String name, User user);

    @Query("""
            SELECT COUNT(c) > 0 FROM Category c 
            WHERE LOWER(c.name) = LOWER(:name)
            AND (c.user = :user OR c.user IS NULL)
            """)
    boolean existsByNameAndUserOrSystem(String name, User user);
}
