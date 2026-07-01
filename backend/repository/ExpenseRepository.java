package com.spendix.backend.repository;

import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
}