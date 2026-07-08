package com.spendix.backend.controller;

import com.spendix.backend.dto.JoyGoalDto;
import com.spendix.backend.entity.JoyGoal;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.JoyGoalRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class JoyGoalController {

    private final JoyGoalRepository joyGoalRepository;
    private final UserRepository userRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<JoyGoal>> getAll(Principal principal) {
        return ResponseEntity.ok(joyGoalRepository.findByUser(getUser(principal)));
    }

    @PostMapping
    public ResponseEntity<JoyGoal> add(@RequestBody JoyGoalDto req, Principal principal) {
        JoyGoal goal = JoyGoal.builder()
                .title(req.title())
                .targetAmount(req.targetAmount())
                .currentAmount(req.currentAmount() != null ? req.currentAmount() : 0.0)
                .targetDate(req.targetDate())
                .description(req.description())
                .priority(req.priority() != null ? req.priority() : "Medium")
                .status(req.status() != null ? req.status() : "Active")
                .user(getUser(principal))
                .build();
        return ResponseEntity.ok(joyGoalRepository.save(goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JoyGoal> update(@PathVariable Long id, @RequestBody JoyGoalDto req, Principal principal) {
        JoyGoal goal = joyGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).build();
        }

        goal.setTitle(req.title());
        goal.setTargetAmount(req.targetAmount());
        if (req.currentAmount() != null) {
            goal.setCurrentAmount(req.currentAmount());
        }
        goal.setTargetDate(req.targetDate());
        goal.setDescription(req.description());
        if (req.priority() != null) {
            goal.setPriority(req.priority());
        }
        if (req.status() != null) {
            goal.setStatus(req.status());
        }

        return ResponseEntity.ok(joyGoalRepository.save(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        JoyGoal goal = joyGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).build();
        }

        joyGoalRepository.delete(goal);
        return ResponseEntity.ok().build();
    }
}
