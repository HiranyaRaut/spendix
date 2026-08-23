package com.spendix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_expenses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GroupExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String paidBy; // Name of the member who paid

    private LocalDate date;

    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_expense_participants", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "participant_name")
    @Builder.Default
    private List<String> participants = new ArrayList<>();
}
