package com.spendix.backend.dto;

import java.time.LocalDate;

public record JoyGoalDto(String title, Double targetAmount, Double currentAmount, LocalDate targetDate, String description, String priority, String status) {}
