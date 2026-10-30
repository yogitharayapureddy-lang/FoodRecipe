
package com.example.food_recipe_backend.service;

import com.example.food_recipe_backend.entity.*;
import com.example.food_recipe_backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final SavedRecipeRepository savedRecipeRepository;

    public RecipeService(
            RecipeRepository recipeRepository,
            UserRepository userRepository,
            RatingRepository ratingRepository,
            SavedRecipeRepository savedRecipeRepository) {

        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
        this.savedRecipeRepository = savedRecipeRepository;
    }

    // GET ALL RECIPES
    public List<Recipe> getRecipes() {
        return recipeRepository.findAll();
    }

    // GET ONE RECIPE
    public Recipe getRecipe(Long id) {
        return recipeRepository.findById(id).orElse(null);
    }

    // ADD RECIPE
    public Recipe addRecipe(Recipe recipe, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        recipe.setUser(user);

        return recipeRepository.save(recipe);
    }

    // ADD OR UPDATE RATING
    @Transactional
    public Rating rateRecipe(Long recipeId, Long userId, int value) {

        if (value < 1 || value > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Recipe not found"));

        Rating rating = ratingRepository
                .findByUserIdAndRecipeId(userId, recipeId)
                .orElseGet(Rating::new);

        rating.setUser(user);
        rating.setRecipe(recipe);
        rating.setRating(value);

        return ratingRepository.save(rating);
    }
    
// REMOVE USER'S RATING

@Transactional
public void removeRating(Long recipeId, Long userId) {

    Rating rating = ratingRepository
            .findByUserIdAndRecipeId(userId, recipeId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rating not found"
            ));

    ratingRepository.delete(rating);
}


@Transactional
public Recipe addMyRecipe(Recipe recipe, Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "User not found"
        ));

    recipe.setId(null);
    recipe.setCreatedBy(user);

    return recipeRepository.save(recipe);
}

public List<Recipe> getMyRecipes(Long userId) {
    return recipeRepository
        .findByCreatedByIdOrderByIdDesc(userId);
}

@Transactional
public void deleteMyRecipe(Long recipeId, Long userId) {
    Recipe recipe = recipeRepository
        .findByIdAndCreatedById(recipeId, userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Recipe not found or you are not its owner"
        ));

    // Delete dependent saved-recipe and rating records first.
    savedRecipeRepository.deleteAll(
        savedRecipeRepository.findByRecipeId(recipeId)
    );

    ratingRepository.deleteAll(
        ratingRepository.findByRecipeId(recipeId)
    );

    recipeRepository.delete(recipe);
}

    // UPDATE RECIPE CREATED BY LOGGED-IN USER
    @Transactional
    public Recipe updateMyRecipe(
            Long recipeId,
            Recipe updatedRecipe,
            Long userId) {

        Recipe recipe = recipeRepository
                .findByIdAndCreatedById(recipeId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You can edit only your own recipes"
                ));

        if (updatedRecipe.getName() == null ||
                updatedRecipe.getName().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Recipe name is required"
            );
        }

        recipe.setName(updatedRecipe.getName());
        recipe.setDescription(updatedRecipe.getDescription());
        recipe.setIngredients(updatedRecipe.getIngredients());
        recipe.setInstructions(updatedRecipe.getInstructions());
        recipe.setCuisine(updatedRecipe.getCuisine());
        recipe.setCategory(updatedRecipe.getCategory());
        recipe.setDietary(updatedRecipe.getDietary());
        recipe.setImageUrl(updatedRecipe.getImageUrl());

        return recipeRepository.save(recipe);
    }

    
    // SAVE RECIPE
    @Transactional
    public SavedRecipe saveRecipe(Long recipeId, Long userId) {

        if (savedRecipeRepository.existsByUserIdAndRecipeId(
                userId, recipeId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Recipe already saved");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Recipe not found"));

        SavedRecipe saved = new SavedRecipe();
        saved.setUser(user);
        saved.setRecipe(recipe);

        return savedRecipeRepository.save(saved);
    }

    // REMOVE SAVED RECIPE
    @Transactional
    public void removeSavedRecipe(Long recipeId, Long userId) {

        SavedRecipe saved = savedRecipeRepository
                .findByUserIdAndRecipeId(userId, recipeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Recipe is not saved"));

        savedRecipeRepository.delete(saved);
    }

    // GET SAVED RECIPES
    public List<SavedRecipe> getSavedRecipes(Long userId) {
        return savedRecipeRepository.findByUserId(userId);
    }

    // GET USER RATINGS
    public List<Rating> getMyRatings(Long userId) {
        return ratingRepository.findByUserId(userId);
    }

    // SEARCH RECIPES
    public List<Recipe> search(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return recipeRepository.findAll();
        }

        return recipeRepository.searchRecipes(keyword.trim());
    }
}
