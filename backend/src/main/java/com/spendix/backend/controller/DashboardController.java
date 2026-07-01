package com.spendix.backend.controller;

import com.spendix.backend.dto.CategorySummaryDto;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.IncomeRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        double totalIncome = incomeRepository.findByUser(user)
                .stream()
                .mapToDouble(i -> i.getAmount())
                .sum();

        double totalExpense = expenseRepository.findByUser(user)
                .stream()
                .mapToDouble(e -> e.getAmount())
                .sum();

        return ResponseEntity.ok(Map.of(
                "totalIncome", totalIncome,
                "totalExpense", totalExpense,
                "balance", totalIncome - totalExpense
        ));
    }

    @GetMapping("/category-summary")
    public ResponseEntity<List<CategorySummaryDto>> getCategorySummary(
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                expenseRepository.getCategorySummary(user)
        );
    }
}