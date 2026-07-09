package com.spendix.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String icon; // Emoji character
    private String color; // Hex color code

    @Column(nullable = false)
    private String type; // EXPENSE, INCOME, BOTH

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user; // null represents global default category
}
