
package com.example.food_recipe_backend.controller;

import com.example.food_recipe_backend.dto.DonationRequest;
import com.example.food_recipe_backend.dto.VerifyDonationRequest;
import com.example.food_recipe_backend.service.DonationService;
import com.razorpay.RazorpayException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService service;

    public DonationController(DonationService service) {
        this.service = service;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody DonationRequest request)
            throws RazorpayException {

        System.out.println(
            "========== DONATION REQUEST =========="
        );

        System.out.println(
            "Donation controller reached"
        );

        System.out.println(
            "Recipe ID: " + request.recipeId()
        );

        System.out.println(
            "Amount: " + request.amount()
        );

        Map<String, Object> result =
            service.createOrder(request);

        System.out.println(
            "Donation order successfully created"
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(
            @RequestBody VerifyDonationRequest request)
            throws RazorpayException {

        System.out.println(
            "Payment verification requested"
        );

        Map<String, String> result =
            service.verifyPayment(request);

        System.out.println(
            "Payment verification completed"
        );

        return ResponseEntity.ok(result);
    }
}
