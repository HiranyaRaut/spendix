package com.spendix.backend.dto;

public record CategorySummaryDto(
        String category,
        String icon,
        String color,
        Double amount
) {}