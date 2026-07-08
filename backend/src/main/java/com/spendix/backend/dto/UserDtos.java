package com.spendix.backend.dto;

public class UserDtos {
    public record UserProfileResponse(Long id, String name, String email, String profilePicture) {}
    public record UpdateProfileRequest(String name, String email, String profilePicture) {}
    public record ChangePasswordRequest(String oldPassword, String newPassword) {}
}
