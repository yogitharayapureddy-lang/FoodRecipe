
package com.example.food_recipe_backend.repository;

import com.example.food_recipe_backend.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("""
        SELECT r FROM Recipe r
        WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.ingredients) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.category) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.dietary) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Recipe> searchRecipes(@Param("keyword") String keyword);
    List<Recipe> findByCreatedByIdOrderByIdDesc(Long userId);

Optional<Recipe> findByIdAndCreatedById(
    Long recipeId,
    Long userId
);
}