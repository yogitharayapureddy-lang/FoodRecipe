package com.example.food_recipe_backend.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    public Rating() {
    }

    public Long getId() {
        return id;
    }

    public int getRating() {
        return rating;
    }

    public User getUser() {
        return user;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }
}
