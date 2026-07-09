package com.spendix.backend.dto;

public class CategoryDtos {
    public record CategoryRequest(String name, String icon, String color, String type) {}
    public record CategoryResponse(Long id, String name, String icon, String color, String type, boolean isCustom) {}
}
