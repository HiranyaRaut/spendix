package com.spendix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "expense")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double amount;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    private String paymentMethod;
    private LocalDate date;

    private Integer joyScore;
    private Boolean planned;
    private Boolean goalAligned;

    private String merchant;
    private String joyReason;
    private String receiptImageUrl;
    private String location;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}