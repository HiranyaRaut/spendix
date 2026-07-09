package com.spendix.backend.dto;

import java.time.LocalDateTime;

public class UserDtos {
    public record UserProfileResponse(
            Long id,
            String name,
            String email,
            String profilePicture,
            String personality,
            String motivation,
            Boolean enabled,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record UpdateProfileRequest(
            String name,
            String email,
            String profilePicture,
            String personality,
            String motivation
    ) {}

    public record ChangePasswordRequest(String oldPassword, String newPassword) {}
}
