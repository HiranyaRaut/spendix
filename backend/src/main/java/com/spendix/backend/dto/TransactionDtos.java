package com.spendix.backend.dto;

import java.time.LocalDate;

public class TransactionDtos {
    public record IncomeRequest(String title, Double amount, Long categoryId, LocalDate date) {}
    public record ExpenseRequest(
            String title,
            Double amount,
            Long categoryId,
            String paymentMethod,
            LocalDate date,
            Integer joyScore,
            Boolean planned,
            Boolean goalAligned,
            String merchant,
            String joyReason,
            String receiptImageUrl,
            String location
    ) {}
}