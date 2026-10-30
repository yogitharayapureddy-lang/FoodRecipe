
package com.example.food_recipe_backend.controller;

import com.example.food_recipe_backend.entity.*;
import com.example.food_recipe_backend.service.RecipeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    private Long getUserId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }

    // PUBLIC RECIPES
    @GetMapping
    public List<Recipe> getRecipes() {
        return service.getRecipes();
    }

    // PUBLIC SEARCH
    @GetMapping("/search")
    public List<Recipe> search(
            @RequestParam String keyword) {

        return service.search(keyword);
    }

    // PUBLIC RECIPE DETAILS
    @GetMapping("/{id}")
    public Recipe getRecipe(@PathVariable Long id) {
        return service.getRecipe(id);
    }

    // PUBLISH RECIPE
    @PostMapping
    public ResponseEntity<Recipe> addRecipe(
            @RequestBody Recipe recipe,
            Authentication auth) {

        Recipe created = service.addMyRecipe(
            recipe,
            getUserId(auth)
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(created);
    }

    // MY RECIPES
    @GetMapping("/mine")
    public List<Recipe> getMyRecipes(Authentication auth) {
        return service.getMyRecipes(getUserId(auth));
    }

    // DELETE OWN RECIPE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMyRecipe(
            @PathVariable Long id,
            Authentication auth) {

        service.deleteMyRecipe(id, getUserId(auth));

        return ResponseEntity.ok(
            "Recipe deleted successfully"
        );
    }

    // RATE RECIPE
    @PostMapping("/{id}/rate")
    public ResponseEntity<String> rateRecipe(
            @PathVariable Long id,
            @RequestParam int rating,
            Authentication auth) {

        service.rateRecipe(id, getUserId(auth), rating);

        return ResponseEntity.ok(
            "Rating saved successfully"
        );
    }

    // MY RATINGS
    @GetMapping("/ratings/mine")
    public List<Rating> getMyRatings(Authentication auth) {
        return service.getMyRatings(getUserId(auth));
    }

    // REMOVE RATING
    @DeleteMapping("/{id}/rate")
    public ResponseEntity<String> removeRating(
            @PathVariable Long id,
            Authentication auth) {

        service.removeRating(id, getUserId(auth));

        return ResponseEntity.ok(
            "Rating removed successfully"
        );
    }
    
    // EDIT OWN RECIPE
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateMyRecipe(
            @PathVariable Long id,
            @RequestBody Recipe recipe,
            Authentication auth) {

        Recipe updated = service.updateMyRecipe(
                id,
                recipe,
                getUserId(auth)
        );

        return ResponseEntity.ok(updated);
    }

    


    // SAVE RECIPE
    @PostMapping("/{id}/save")
    public SavedRecipe saveRecipe(
            @PathVariable Long id,
            Authentication auth) {

        return service.saveRecipe(id, getUserId(auth));
    }

    // SAVED RECIPES
    @GetMapping("/saved")
    public List<SavedRecipe> getSavedRecipes(
            Authentication auth) {

        return service.getSavedRecipes(getUserId(auth));
    }

    // REMOVE SAVED RECIPE
    @DeleteMapping("/{id}/save")
    public ResponseEntity<String> removeSavedRecipe(
            @PathVariable Long id,
            Authentication auth) {

        service.removeSavedRecipe(id, getUserId(auth));

        return ResponseEntity.ok(
            "Recipe removed successfully"
        );
    }
}
