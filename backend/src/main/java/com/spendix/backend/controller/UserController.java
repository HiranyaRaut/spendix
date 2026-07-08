package com.spendix.backend.controller;

import com.spendix.backend.dto.UserDtos.*;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest req, Principal principal) {
        User user = getUser(principal);
        
        // If email changed, check if new email already exists
        if (req.email() != null && !req.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(req.email())) {
                return ResponseEntity.badRequest().body("Email is already in use");
            }
            user.setEmail(req.email());
        }
        
        if (req.name() != null) {
            user.setName(req.name());
        }
        
        if (req.profilePicture() != null) {
            user.setProfilePicture(req.profilePicture());
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture()
        ));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req, Principal principal) {
        User user = getUser(principal);
        
        if (!passwordEncoder.matches(req.oldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password does not match");
        }
        
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok("Password changed successfully");
    }
}
