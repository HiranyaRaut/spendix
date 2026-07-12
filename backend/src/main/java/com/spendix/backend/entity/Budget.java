package com.spendix.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budget")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Integer month; // 1 to 12

    @Column(nullable = false)
    private Integer year;
}
