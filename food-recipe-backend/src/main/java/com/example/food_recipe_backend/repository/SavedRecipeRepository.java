
package com.example.food_recipe_backend.repository;

import com.example.food_recipe_backend.entity.SavedRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, Long> {

    List<SavedRecipe> findByUserId(Long userId);

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    Optional<SavedRecipe> findByUserIdAndRecipeId(Long userId, Long recipeId);
    List<SavedRecipe> findByRecipeId(Long recipeId);
}
