package com.spendix.backend.repository;

import com.spendix.backend.dto.CategorySummaryDto;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    @Query("""
            SELECT new com.spendix.backend.dto.CategorySummaryDto(
                e.category.name,
                e.category.icon,
                e.category.color,
                SUM(e.amount)
            )
            FROM Expense e
            WHERE e.user = :user
            GROUP BY e.category.name, e.category.icon, e.category.color
            """)
    List<CategorySummaryDto> getCategorySummary(User user);
}