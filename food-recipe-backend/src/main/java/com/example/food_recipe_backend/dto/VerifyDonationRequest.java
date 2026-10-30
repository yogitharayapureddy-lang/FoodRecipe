package com.example.food_recipe_backend.dto;

public record VerifyDonationRequest(
    String razorpayOrderId,
    String razorpayPaymentId,
    String razorpaySignature
) {}