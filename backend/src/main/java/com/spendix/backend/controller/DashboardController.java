package com.spendix.backend.controller;

import com.spendix.backend.dto.CategorySummaryDto;
import com.spendix.backend.entity.User;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.JoyGoal;
import com.spendix.backend.entity.ImpulseAvoided;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.IncomeRepository;
import com.spendix.backend.repository.UserRepository;
import com.spendix.backend.repository.JoyGoalRepository;
import com.spendix.backend.repository.ImpulseAvoidedRepository;
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
    private final JoyGoalRepository joyGoalRepository;
    private final ImpulseAvoidedRepository impulseAvoidedRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        double totalIncome = incomeRepository.findByUser(user)
                .stream()
                .mapToDouble(i -> i.getAmount())
                .sum();

        List<Expense> expenses = expenseRepository.findByUser(user);
        double totalExpense = expenses
                .stream()
                .mapToDouble(e -> e.getAmount())
                .sum();

        double avgJoyScore = expenses
                .stream()
                .filter(e -> e.getJoyScore() != null)
                .mapToInt(e -> e.getJoyScore())
                .average()
                .orElse(0.0);

        List<JoyGoal> goals = joyGoalRepository.findByUser(user);
        double totalTarget = goals.stream().mapToDouble(g -> g.getTargetAmount()).sum();
        double totalCurrent = goals.stream().mapToDouble(g -> g.getCurrentAmount()).sum();
        double goalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0.0;

        // Purchases Supporting Goals (Percentage of expenses where goalAligned is true)
        long totalExpensesCount = expenses.size();
        long alignedExpensesCount = expenses.stream()
                .filter(e -> Boolean.TRUE.equals(e.getGoalAligned()))
                .count();
        double purchasesSupportingGoals = totalExpensesCount > 0 
                ? ((double) alignedExpensesCount / totalExpensesCount) * 100 
                : 0.0;

        // Avoided Impulse Purchases stats
        List<ImpulseAvoided> avoidedList = impulseAvoidedRepository.findByUser(user);
        long avoidedCount = avoidedList.size();
        double avoidedMoney = avoidedList.stream()
                .mapToDouble(ImpulseAvoided::getAmount)
                .sum();

        // Total savings = money allocated to goals + avoided impulse savings
        double totalSavings = totalCurrent + avoidedMoney;

        return ResponseEntity.ok(Map.of(
                "totalIncome", totalIncome,
                "totalExpense", totalExpense,
                "balance", totalIncome - totalExpense,
                "joyScore", Math.round(avgJoyScore),
                "goalProgress", Math.round(goalProgress),
                "savings", totalSavings,
                "purchasesSupportingGoals", Math.round(purchasesSupportingGoals),
                "avoidedCount", avoidedCount,
                "avoidedMoney", avoidedMoney
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