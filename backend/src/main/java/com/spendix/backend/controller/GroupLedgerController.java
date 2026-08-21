package com.spendix.backend.controller;

import com.spendix.backend.dto.GroupDtos.*;
import com.spendix.backend.entity.Group;
import com.spendix.backend.entity.GroupExpense;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.GroupExpenseRepository;
import com.spendix.backend.repository.GroupRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupLedgerController {

    private final GroupRepository groupRepository;
    private final GroupExpenseRepository groupExpenseRepository;
    private final UserRepository userRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getGroups(Principal principal) {
        User user = getUser(principal);
        List<Group> groups = groupRepository.findByUser(user);

        List<GroupResponse> response = groups.stream()
                .map(g -> new GroupResponse(
                        g.getId(),
                        g.getName(),
                        g.getMembers(),
                        Collections.emptyList(),
                        Collections.emptyList()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody GroupRequest req, Principal principal) {
        User user = getUser(principal);

        if (req.name() == null || req.name().isBlank()) {
            return ResponseEntity.badRequest().body("Group name is required");
        }
        if (req.members() == null || req.members().size() < 2) {
            return ResponseEntity.badRequest().body("Group must have at least 2 members");
        }

        // Clean names to remove extra spaces
        List<String> cleanedMembers = req.members().stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (cleanedMembers.size() < 2) {
            return ResponseEntity.badRequest().body("Group must have at least 2 unique members");
        }

        Group group = Group.builder()
                .name(req.name().trim())
                .user(user)
                .members(cleanedMembers)
                .build();

        Group saved = groupRepository.save(group);

        return ResponseEntity.ok(new GroupResponse(
                saved.getId(),
                saved.getName(),
                saved.getMembers(),
                Collections.emptyList(),
                Collections.emptyList()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroup(@PathVariable Long id, Principal principal) {
        User user = getUser(principal);
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        List<GroupExpense> expenses = groupExpenseRepository.findByGroup(group);

        List<GroupExpenseResponse> expenseResponses = expenses.stream()
                .map(e -> new GroupExpenseResponse(
                        e.getId(),
                        e.getDescription(),
                        e.getAmount(),
                        e.getPaidBy(),
                        e.getDate(),
                        e.getParticipants()
                ))
                .collect(Collectors.toList());

        List<DebtTransfer> debtTransfers = calculateDebtTransfers(group.getMembers(), expenses);

        return ResponseEntity.ok(new GroupResponse(
                group.getId(),
                group.getName(),
                group.getMembers(),
                expenseResponses,
                debtTransfers
        ));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteGroup(@PathVariable Long id, Principal principal) {
        User user = getUser(principal);
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        groupExpenseRepository.deleteByGroup(group);
        groupRepository.delete(group);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/expenses")
    public ResponseEntity<?> addGroupExpense(
            @PathVariable Long id,
            @RequestBody GroupExpenseRequest req,
            Principal principal) {
        User user = getUser(principal);
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        if (req.description() == null || req.description().isBlank()) {
            return ResponseEntity.badRequest().body("Expense description is required");
        }
        if (req.amount() == null || req.amount() <= 0) {
            return ResponseEntity.badRequest().body("Amount must be greater than zero");
        }
        if (req.paidBy() == null || req.paidBy().isBlank()) {
            return ResponseEntity.badRequest().body("Payer is required");
        }

        // Verify paidBy is a member of the group
        boolean isValidPayer = group.getMembers().stream()
                .anyMatch(member -> member.equalsIgnoreCase(req.paidBy().trim()));
        if (!isValidPayer) {
            return ResponseEntity.badRequest().body("Payer must be a member of the group");
        }

        // Determine participants
        List<String> participants = req.participants();
        if (participants == null || participants.isEmpty()) {
            // Default to all members
            participants = new ArrayList<>(group.getMembers());
        } else {
            // Clean participants list
            participants = participants.stream()
                    .map(String::trim)
                    .filter(p -> !p.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            // Verify all participants belong to the group
            for (String participant : participants) {
                boolean isMember = group.getMembers().stream()
                        .anyMatch(member -> member.equalsIgnoreCase(participant));
                if (!isMember) {
                    return ResponseEntity.badRequest().body("Participant " + participant + " is not in the group");
                }
            }
        }

        if (participants.isEmpty()) {
            return ResponseEntity.badRequest().body("At least one split participant is required");
        }

        GroupExpense expense = GroupExpense.builder()
                .description(req.description().trim())
                .amount(req.amount())
                .paidBy(req.paidBy().trim())
                .date(req.date() != null ? req.date() : LocalDate.now())
                .group(group)
                .participants(participants)
                .build();

        GroupExpense saved = groupExpenseRepository.save(expense);

        return ResponseEntity.ok(new GroupExpenseResponse(
                saved.getId(),
                saved.getDescription(),
                saved.getAmount(),
                saved.getPaidBy(),
                saved.getDate(),
                saved.getParticipants()
        ));
    }

    @DeleteMapping("/{id}/expenses/{expenseId}")
    public ResponseEntity<?> deleteGroupExpense(
            @PathVariable Long id,
            @PathVariable Long expenseId,
            Principal principal) {
        User user = getUser(principal);
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        GroupExpense expense = groupExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getGroup().getId().equals(group.getId())) {
            return ResponseEntity.badRequest().body("Expense does not belong to this group");
        }

        groupExpenseRepository.delete(expense);

        return ResponseEntity.ok().build();
    }

    // Debt Simplification Algorithm
    public static List<DebtTransfer> calculateDebtTransfers(List<String> members, List<GroupExpense> expenses) {
        List<DebtTransfer> transfers = new ArrayList<>();
        if (members == null || members.isEmpty()) {
            return transfers;
        }

        // Initialize balances
        Map<String, Double> balances = new HashMap<>();
        for (String member : members) {
            balances.put(member, 0.0);
        }

        // Calculate net balance for each member
        for (GroupExpense expense : expenses) {
            double amount = expense.getAmount();
            String paidBy = expense.getPaidBy();
            List<String> participants = expense.getParticipants();

            if (participants == null || participants.isEmpty()) {
                participants = members; // Default split fallback
            }

            double splitAmount = amount / participants.size();

            // Payer gets credit for total amount
            balances.put(paidBy, balances.get(paidBy) + amount);

            // Participants get debited splitAmount
            for (String participant : participants) {
                balances.put(participant, balances.get(participant) - splitAmount);
            }
        }

        // Separate debtors and creditors
        List<MemberBalance> debtors = new ArrayList<>();
        List<MemberBalance> creditors = new ArrayList<>();

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            double balance = entry.getValue();
            if (balance < -0.01) {
                debtors.add(new MemberBalance(entry.getKey(), -balance)); // absolute value
            } else if (balance > 0.01) {
                creditors.add(new MemberBalance(entry.getKey(), balance));
            }
        }

        // Greedy algorithm matching debtors and creditors to minimize transactions
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            debtors.sort((a, b) -> Double.compare(b.balance(), a.balance()));
            creditors.sort((a, b) -> Double.compare(b.balance(), a.balance()));

            MemberBalance debtor = debtors.get(0);
            MemberBalance creditor = creditors.get(0);

            double transferAmount = Math.min(debtor.balance(), creditor.balance());
            double roundedAmount = Math.round(transferAmount * 100.0) / 100.0;

            if (roundedAmount > 0) {
                transfers.add(new DebtTransfer(debtor.name(), creditor.name(), roundedAmount));
            }

            debtors.set(0, new MemberBalance(debtor.name(), debtor.balance() - transferAmount));
            creditors.set(0, new MemberBalance(creditor.name(), creditor.balance() - transferAmount));

            if (debtors.get(0).balance() < 0.01) {
                debtors.remove(0);
            }
            if (creditors.get(0).balance() < 0.01) {
                creditors.remove(0);
            }
        }

        return transfers;
    }

    private record MemberBalance(String name, double balance) {}
}
