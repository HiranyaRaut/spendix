package com.spendix.backend.controller;

import com.spendix.backend.dto.TransactionDtos.ExpenseRequest;
import com.spendix.backend.entity.Category;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.ImpulseAvoided;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.CategoryRepository;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.UserRepository;
import com.spendix.backend.repository.ImpulseAvoidedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ImpulseAvoidedRepository impulseAvoidedRepository;
    private final CategoryRepository categoryRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(Principal principal) {

        System.out.println("Principal = " + principal);

        return ResponseEntity.ok(
                expenseRepository.findByUser(getUser(principal))
        );
    }

    @PostMapping
    public ResponseEntity<Expense> add(@RequestBody ExpenseRequest req, Principal principal) {
        Category category = null;
        if (req.categoryId() != null) {
            category = categoryRepository.findById(req.categoryId()).orElse(null);
        }
        if (category == null) {
            category = categoryRepository.findByNameAndUserOrSystem("General", getUser(principal))
                    .stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Default General category not found"));
        }

        Expense expense = Expense.builder()
                .title(req.title()).amount(req.amount())
                .category(category).paymentMethod(req.paymentMethod())
                .date(req.date())
                .joyScore(req.joyScore())
                .planned(req.planned())
                .goalAligned(req.goalAligned())
                .merchant(req.merchant())
                .joyReason(req.joyReason())
                .receiptImageUrl(req.receiptImageUrl())
                .location(req.location())
                .user(getUser(principal)).build();
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @PostMapping("/avoided")
    public ResponseEntity<ImpulseAvoided> addAvoided(@RequestBody ExpenseRequest req, Principal principal) {
        String categoryName = "General";
        if (req.categoryId() != null) {
            categoryName = categoryRepository.findById(req.categoryId())
                    .map(Category::getName)
                    .orElse("General");
        }

        ImpulseAvoided avoided = ImpulseAvoided.builder()
                .title(req.title())
                .amount(req.amount())
                .category(categoryName)
                .date(req.date() != null ? req.date() : java.time.LocalDate.now())
                .user(getUser(principal))
                .build();
        return ResponseEntity.ok(impulseAvoidedRepository.save(avoided));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        expenseRepository.delete(expense);

        return ResponseEntity.ok().build();
    }
}