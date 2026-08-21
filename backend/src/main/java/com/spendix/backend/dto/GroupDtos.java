package com.spendix.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class GroupDtos {

    public record GroupRequest(
            String name,
            List<String> members
    ) {}

    public record GroupResponse(
            Long id,
            String name,
            List<String> members,
            List<GroupExpenseResponse> expenses,
            List<DebtTransfer> debtTransfers
    ) {}

    public record GroupExpenseRequest(
            String description,
            Double amount,
            String paidBy,
            LocalDate date,
            List<String> participants
    ) {}

    public record GroupExpenseResponse(
            Long id,
            String description,
            Double amount,
            String paidBy,
            LocalDate date,
            List<String> participants
    ) {}

    public record DebtTransfer(
            String from,
            String to,
            Double amount
    ) {}
}
