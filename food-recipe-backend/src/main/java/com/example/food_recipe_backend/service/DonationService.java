
package com.example.food_recipe_backend.service;

import com.example.food_recipe_backend.dto.DonationRequest;
import com.example.food_recipe_backend.dto.VerifyDonationRequest;
import com.example.food_recipe_backend.entity.Donation;
import com.example.food_recipe_backend.entity.Recipe;
import com.example.food_recipe_backend.entity.User;
import com.example.food_recipe_backend.repository.DonationRepository;
import com.example.food_recipe_backend.repository.RecipeRepository;

import com.razorpay.*;
import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
public class DonationService {

    private final DonationRepository repository;
    private final RecipeRepository recipeRepository;
    private final EmailService emailService;

    private final String keyId;
    private final String keySecret;

    public DonationService(
            DonationRepository repository,
            RecipeRepository recipeRepository,
            EmailService emailService,
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {

        this.repository = repository;
        this.recipeRepository = recipeRepository;
        this.emailService = emailService;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    public Map<String, Object> createOrder(
            DonationRequest request)
            throws RazorpayException {

        if (request == null ||
            request.amount() == null ||
            request.recipeId() == null ||
            request.donorName() == null ||
            request.donorName().isBlank() ||
            request.donorName().length() > 100) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid donation details"
            );
        }

        BigDecimal amount = request.amount();

        if (amount.compareTo(
                new BigDecimal("10")) < 0 ||
            amount.compareTo(
                new BigDecimal("10000")) > 0 ||
            amount.stripTrailingZeros().scale() > 2) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Donation must be between Rs.10 and Rs.10000"
            );
        }

        // Find the selected recipe
        Recipe recipe = recipeRepository
            .findById(request.recipeId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Recipe not found"
                )
            );

        // Identify its creator
        User creator = recipe.getUser();

        if (creator == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Recipe creator not found"
            );
        }

        long amountPaise = amount
            .movePointRight(2)
            .longValueExact();

        RazorpayClient client =
            new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();

        options.put("amount", amountPaise);
        options.put("currency", "INR");
        options.put(
            "receipt",
            UUID.randomUUID().toString()
        );

        Order order = client.orders.create(options);

        String orderId = order.get("id");

        // Save initial donation
        Donation donation = new Donation();

        donation.setDonorName(
            request.donorName().trim()
        );

        donation.setAmountPaise(amountPaise);
        donation.setRazorpayOrderId(orderId);
        donation.setStatus("CREATED");

        donation.setRecipe(recipe);
        donation.setRecipientUser(creator);

        repository.save(donation);

        return Map.of(
            "orderId", orderId,
            "amount", amountPaise,
            "currency", "INR",
            "keyId", keyId
        );
    }

    public Map<String, String> verifyPayment(
            VerifyDonationRequest request)
            throws RazorpayException {

        if (request == null ||
            request.razorpayOrderId() == null ||
            request.razorpayPaymentId() == null ||
            request.razorpaySignature() == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Missing payment details"
            );
        }

        Donation donation = repository
            .findByRazorpayOrderId(
                request.razorpayOrderId()
            )
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donation order not found"
                )
            );

        // Avoid duplicate notifications
        if ("PAID".equals(donation.getStatus())) {

            if (request.razorpayPaymentId()
                    .equals(
                        donation.getRazorpayPaymentId()
                    )) {

                return Map.of("status", "PAID");
            }

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Order already paid"
            );
        }

        // Verify Razorpay signature
        JSONObject verification = new JSONObject();

        verification.put(
            "razorpay_order_id",
            donation.getRazorpayOrderId()
        );

        verification.put(
            "razorpay_payment_id",
            request.razorpayPaymentId()
        );

        verification.put(
            "razorpay_signature",
            request.razorpaySignature()
        );

        boolean valid =
            Utils.verifyPaymentSignature(
                verification,
                keySecret
            );

        if (!valid) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid payment signature"
            );
        }

        RazorpayClient client =
            new RazorpayClient(keyId, keySecret);

        Payment payment = client.payments.fetch(
            request.razorpayPaymentId()
        );

        String paymentOrderId =
            payment.get("order_id");

        String paymentStatus =
            payment.get("status");

        String currency =
            payment.get("currency");

        Number paidAmount =
            payment.get("amount");

        if (!donation.getRazorpayOrderId()
                .equals(paymentOrderId) ||
            !"INR".equals(currency) ||
            paidAmount == null ||
            paidAmount.longValue() !=
                donation.getAmountPaise()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Payment details mismatch"
            );
        }

        if (!"captured".equals(paymentStatus)) {
            return Map.of("status", "PENDING");
        }

        // Mark donation as successfully paid
        donation.setRazorpayPaymentId(
            request.razorpayPaymentId()
        );

        donation.setStatus("PAID");

        // Persist successful payment first
        Donation savedDonation =
            repository.save(donation);

        // Send creator notification
        // An email failure must not undo a payment
        try {
            emailService.sendDonationReceivedEmail(
                savedDonation
            );
        } catch (Exception e) {
            System.err.println(
                "Donation was paid successfully, " +
                "but email notification failed: " +
                e.getMessage()
            );
        }

        return Map.of(
            "status", "PAID",
            "message",
            "Donation verified successfully"
        );
    }
}
