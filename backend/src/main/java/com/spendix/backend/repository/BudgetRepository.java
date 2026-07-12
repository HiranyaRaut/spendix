package com.spendix.backend.repository;

import com.spendix.backend.entity.Budget;
import com.spendix.backend.entity.Category;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);
    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);
}
