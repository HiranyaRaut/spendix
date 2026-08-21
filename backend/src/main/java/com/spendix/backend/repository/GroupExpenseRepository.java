package com.spendix.backend.repository;

import com.spendix.backend.entity.Group;
import com.spendix.backend.entity.GroupExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupExpenseRepository extends JpaRepository<GroupExpense, Long> {
    List<GroupExpense> findByGroup(Group group);
    void deleteByGroup(Group group);
}
