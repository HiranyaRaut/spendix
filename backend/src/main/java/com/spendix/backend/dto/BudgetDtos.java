package com.spendix.backend.dto;

public class BudgetDtos {
    
    public record BudgetRequest(
            Long categoryId,
            Double amount,
            Integer month,
            Integer year
    ) {}

    public record BudgetResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryIcon,
            String categoryColor,
            Double amount,
            Integer month,
            Integer year
    ) {}

    public record BudgetSummaryResponse(
            Long budgetId,
            Long categoryId,
            String categoryName,
            String categoryIcon,
            String categoryColor,
            Double budgetedAmount,
            Double actualSpent,
            String status // "NORMAL", "WARNING", "EXCEEDED"
    ) {}
}
