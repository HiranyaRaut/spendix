package com.spendix.backend.controller;

import com.spendix.backend.dto.CategoryDtos.*;
import com.spendix.backend.entity.Category;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.CategoryRepository;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(Principal principal) {
        User user = getUser(principal);
        List<Category> categories = categoryRepository.findByUserOrSystem(user);
        List<CategoryResponse> res = categories.stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getName(),
                        c.getIcon(),
                        c.getColor(),
                        c.getType(),
                        c.getUser() != null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody CategoryRequest req, Principal principal) {
        User user = getUser(principal);
        
        if (categoryRepository.existsByNameAndUserOrSystem(req.name(), user)) {
            return ResponseEntity.badRequest().body("Category already exists");
        }

        Category category = Category.builder()
                .name(req.name())
                .icon(req.icon() != null ? req.icon() : "💰")
                .color(req.color() != null ? req.color() : "#c5a059")
                .type(req.type() != null ? req.type().toUpperCase() : "EXPENSE")
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(new CategoryResponse(
                saved.getId(),
                saved.getName(),
                saved.getIcon(),
                saved.getColor(),
                saved.getType(),
                true
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        User user = getUser(principal);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.getUser() == null) {
            return ResponseEntity.badRequest().body("Cannot delete default system categories");
        }

        if (!category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        categoryRepository.delete(category);
        return ResponseEntity.ok().build();
    }
}
