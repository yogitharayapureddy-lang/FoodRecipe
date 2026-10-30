
package com.example.food_recipe_backend.service;

import com.example.food_recipe_backend.entity.Donation;
import com.example.food_recipe_backend.entity.Recipe;
import com.example.food_recipe_backend.entity.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${recipehub.mail.from}")
            String fromEmail) {

        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    public void sendDonationReceivedEmail(
            Donation donation) {

        User creator = donation.getRecipientUser();
        Recipe recipe = donation.getRecipe();

        if (creator == null ||
            creator.getEmail() == null ||
            creator.getEmail().isBlank()) {

            System.out.println(
                "Donation email skipped: " +
                "creator email unavailable"
            );
            return;
        }

        String creatorName =
            creator.getName() == null ||
            creator.getName().isBlank()
                ? "Recipe Creator"
                : creator.getName();

        String recipeName =
            recipe == null
                ? "your recipe"
                : recipe.getName();

        BigDecimal amount = BigDecimal
            .valueOf(donation.getAmountPaise(), 2);

        String subject =
            "RecipeHub - You Received a Donation!";

        String body =
            "Hello " + creatorName + ",\n\n" +

            "Great news! Someone has supported " +
            "your recipe on RecipeHub.\n\n" +

            "DONATION DETAILS\n" +
            "-----------------------------\n" +

            "Recipe: " + recipeName + "\n" +

            "Donor: " +
            donation.getDonorName() + "\n" +

            "Amount: Rs. " +
            amount.toPlainString() + "\n" +

            "Payment Status: PAID\n\n" +

            "Thank you for sharing your " +
            "delicious recipes with the " +
            "RecipeHub community!\n\n" +

            "Keep cooking and inspiring!\n\n" +

            "Best regards,\n" +
            "RecipeHub Team\n\n" +

            "Note: Donations are processed " +
            "through RecipeHub's Razorpay " +
            "merchant account.";

        SimpleMailMessage message =
            new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(creator.getEmail());
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        System.out.println(
            "Donation notification email sent " +
            "successfully"
        );
    }
}

