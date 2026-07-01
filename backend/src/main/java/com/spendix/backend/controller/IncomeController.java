package com.spendix.backend.controller;

import com.spendix.backend.dto.TransactionDtos.IncomeRequest;
import com.spendix.backend.entity.Income;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.IncomeRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Income>> getAll(Principal principal) {
        return ResponseEntity.ok(incomeRepository.findByUser(getUser(principal)));
    }

    @PostMapping
    public ResponseEntity<Income> add(@RequestBody IncomeRequest req, Principal principal) {
        Income income = Income.builder()
                .title(req.title()).amount(req.amount())
                .category(req.category()).date(req.date())
                .user(getUser(principal)).build();
        return ResponseEntity.ok(incomeRepository.save(income));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {

        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        incomeRepository.delete(income);

        return ResponseEntity.ok().build();
    }
}