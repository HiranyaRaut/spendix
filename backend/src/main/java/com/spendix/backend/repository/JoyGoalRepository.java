package com.spendix.backend.repository;

import com.spendix.backend.entity.JoyGoal;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JoyGoalRepository extends JpaRepository<JoyGoal, Long> {
    List<JoyGoal> findByUser(User user);
}
