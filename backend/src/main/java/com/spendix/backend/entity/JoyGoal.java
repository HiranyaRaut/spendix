package com.spendix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "joy_goal")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JoyGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Double targetAmount;

    @Column(nullable = false)
    private Double currentAmount;

    private LocalDate targetDate;

    private String description;
    private String priority; // "High", "Medium", "Low"
    private String status; // "Active", "Completed"

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
