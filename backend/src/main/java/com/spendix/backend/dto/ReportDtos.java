package com.spendix.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ReportDtos {

    public record TransactionItem(
            Long id,
            String type,
            String title,
            Double amount,
            String category,
            LocalDate date,
            String paymentMethod,
            String merchant
    ) {}

    public record ReportSummaryResponse(
            LocalDate startDate,
            LocalDate endDate,
            Double totalIncome,
            Double totalExpense,
            Double netBalance,
            Integer totalTransactions,
            List<CategorySummaryDto> categorySummaries,
            List<TransactionItem> recentTransactions
    ) {}
}
