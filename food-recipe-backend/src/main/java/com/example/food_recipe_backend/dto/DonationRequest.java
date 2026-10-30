
package com.example.food_recipe_backend.dto;

import java.math.BigDecimal;

public record DonationRequest(
    String donorName,
    BigDecimal amount,
    Long recipeId
) {}
