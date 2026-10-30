
package com.example.food_recipe_backend.repository;

import com.example.food_recipe_backend.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonationRepository
        extends JpaRepository<Donation, Long> {

    Optional<Donation> findByRazorpayOrderId(
        String razorpayOrderId
    );
}
