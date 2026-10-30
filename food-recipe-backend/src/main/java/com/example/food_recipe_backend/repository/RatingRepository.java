
package com.example.food_recipe_backend.repository;

import com.example.food_recipe_backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserIdAndRecipeId(
            Long userId, Long recipeId
    );

    List<Rating> findByUserId(Long userId);
    List<Rating> findByRecipeId(Long recipeId);
}
