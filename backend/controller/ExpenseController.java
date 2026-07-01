package com.spendix.backend.controller;

import com.spendix.backend.dto.TransactionDtos.ExpenseRequest;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.UserRepository;
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

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(Principal principal) {
        return ResponseEntity.ok(expenseRepository.findByUser(getUser(principal)));
    }

    @PostMapping
    public ResponseEntity<Expense> add(@RequestBody ExpenseRequest req, Principal principal) {
        Expense expense = Expense.builder()
                .title(req.title()).amount(req.amount())
                .category(req.category()).paymentMethod(req.paymentMethod())
                .date(req.date()).user(getUser(principal)).build();
        return ResponseEntity.ok(expenseRepository.save(expense));
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