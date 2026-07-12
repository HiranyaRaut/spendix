package com.spendix.backend.controller;

import com.spendix.backend.dto.BudgetDtos.*;
import com.spendix.backend.dto.CategoryDtos.CategoryResponse;
import com.spendix.backend.entity.Budget;
import com.spendix.backend.entity.Category;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.BudgetRepository;
import com.spendix.backend.repository.CategoryRepository;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Principal principal) {
        User user = getUser(principal);
        LocalDate now = LocalDate.now();
        int m = (month != null) ? month : now.getMonthValue();
        int y = (year != null) ? year : now.getYear();

        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, m, y);
        List<BudgetResponse> response = budgets.stream()
                .map(b -> new BudgetResponse(
                        b.getId(),
                        b.getCategory().getId(),
                        b.getCategory().getName(),
                        b.getCategory().getIcon(),
                        b.getCategory().getColor(),
                        b.getAmount(),
                        b.getMonth(),
                        b.getYear()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> setBudget(@RequestBody BudgetRequest req, Principal principal) {
        User user = getUser(principal);

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Verify category belongs to user or is default
        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        LocalDate now = LocalDate.now();
        int m = (req.month() != null) ? req.month() : now.getMonthValue();
        int y = (req.year() != null) ? req.year() : now.getYear();

        Optional<Budget> existingOpt = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, m, y);
        Budget budget;

        if (existingOpt.isPresent()) {
            budget = existingOpt.get();
            budget.setAmount(req.amount());
        } else {
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .amount(req.amount())
                    .month(m)
                    .year(y)
                    .build();
        }

        Budget saved = budgetRepository.save(budget);

        return ResponseEntity.ok(new BudgetResponse(
                saved.getId(),
                saved.getCategory().getId(),
                saved.getCategory().getName(),
                saved.getCategory().getIcon(),
                saved.getCategory().getColor(),
                saved.getAmount(),
                saved.getMonth(),
                saved.getYear()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Principal principal) {
        User user = getUser(principal);
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<List<BudgetSummaryResponse>> getBudgetSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Principal principal) {
        User user = getUser(principal);
        LocalDate now = LocalDate.now();
        int m = (month != null) ? month : now.getMonthValue();
        int y = (year != null) ? year : now.getYear();

        // 1. Get all budgets for the month
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, m, y);
        Map<Long, Budget> budgetMap = budgets.stream()
                .collect(Collectors.toMap(b -> b.getCategory().getId(), b -> b));

        // 2. Get all expenses for the month
        List<Expense> expenses = expenseRepository.findByUserAndMonthAndYear(user, m, y);
        Map<Long, Double> expenseMap = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getId(),
                        Collectors.summingDouble(Expense::getAmount)
                ));

        // 3. Get all active categories to make sure we don't miss categories
        List<Category> categories = categoryRepository.findByUserOrSystem(user);

        List<BudgetSummaryResponse> summaryList = new ArrayList<>();

        // Create summary for categories that have budgets or expenses
        for (Category category : categories) {
            Long catId = category.getId();
            Budget budget = budgetMap.get(catId);
            Double spent = expenseMap.getOrDefault(catId, 0.0);

            if (budget == null && spent == 0.0) {
                // Skip categories with no budget and no spending
                continue;
            }

            Double budgetAmount = (budget != null) ? budget.getAmount() : 0.0;
            String status = "NORMAL";
            
            if (budgetAmount > 0.0) {
                double ratio = spent / budgetAmount;
                if (ratio >= 1.0) {
                    status = "EXCEEDED";
                } else if (ratio >= 0.8) {
                    status = "WARNING";
                }
            }

            summaryList.add(new BudgetSummaryResponse(
                    (budget != null) ? budget.getId() : null,
                    catId,
                    category.getName(),
                    category.getIcon(),
                    category.getColor(),
                    budgetAmount,
                    spent,
                    status
            ));
        }

        // Sort: budgeted first, then by spent amount descending
        summaryList.sort((a, b) -> {
            if (a.budgetedAmount() > 0.0 && b.budgetedAmount() == 0.0) return -1;
            if (a.budgetedAmount() == 0.0 && b.budgetedAmount() > 0.0) return 1;
            return Double.compare(b.actualSpent(), a.actualSpent());
        });

        return ResponseEntity.ok(summaryList);
    }
}
