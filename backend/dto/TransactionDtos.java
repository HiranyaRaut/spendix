package com.spendix.backend.dto;

import java.time.LocalDate;

public class TransactionDtos {
    public record IncomeRequest(String title, Double amount, String category, LocalDate date) {}
    public record ExpenseRequest(String title, Double amount, String category, String paymentMethod, LocalDate date) {}
}