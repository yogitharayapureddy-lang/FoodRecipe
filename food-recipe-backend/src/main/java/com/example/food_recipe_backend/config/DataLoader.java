
package com.example.food_recipe_backend.config;

import com.example.food_recipe_backend.entity.Recipe;
import com.example.food_recipe_backend.repository.RecipeRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;
import java.util.HashSet;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadRecipes(RecipeRepository repository) {

        return args -> {

            // Load existing names to prevent duplicate recipes.
            Set<String> existingNames = new HashSet<>();

            repository.findAll().forEach(recipe ->
                existingNames.add(
                    recipe.getName().trim().toLowerCase()
                )
            );

            // 1. CHICKEN BIRYANI
            addRecipe(repository, existingNames,
                "Chicken Biryani",
                "Aromatic basmati rice layered with spicy chicken, herbs and saffron.",
                """
                500 g chicken
                2 cups basmati rice
                2 large onions, sliced
                2 tomatoes, chopped
                1 cup plain yogurt
                2 tbsp ginger-garlic paste
                2 tsp biryani masala
                1 tsp red chilli powder
                1/2 tsp turmeric
                1 tsp garam masala
                1/4 cup chopped mint
                1/4 cup chopped coriander
                3 tbsp oil or ghee
                1 cinnamon stick
                4 cloves
                3 cardamom pods
                Salt to taste
                1/4 cup warm milk with a pinch of saffron
                """,
                """
                Step 1: Wash basmati rice and soak it in water for 30 minutes.
                Step 2: Mix chicken with yogurt, ginger-garlic paste, chilli powder, turmeric, biryani masala and salt. Marinate for at least 30 minutes.
                Step 3: Heat oil in a heavy-bottomed pot. Fry sliced onions until golden brown. Remove half for garnishing.
                Step 4: Add cinnamon, cloves and cardamom to the pot. Add tomatoes and cook until soft.
                Step 5: Add marinated chicken and cook for 15–20 minutes, until the chicken is almost cooked.
                Step 6: Meanwhile, boil rice in salted water until about 70% cooked. Drain the water.
                Step 7: Spread the partially cooked rice over the chicken. Add mint, coriander, fried onions, garam masala and saffron milk.
                Step 8: Cover tightly and cook on very low heat for 20–25 minutes until the chicken is fully cooked and rice is tender.
                Step 9: Rest for 10 minutes, gently fluff and serve with raita.
                """,
                "Indian", "Main Course", "Non-Vegetarian",
                "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=900&fit=crop"
            );

            // 2. CREAMY GARLIC PASTA
            addRecipe(repository, existingNames,
                "Creamy Garlic Pasta",
                "Tender pasta coated in a rich garlic, cream and parmesan sauce.",
                """
                250 g pasta
                5 garlic cloves, finely chopped
                2 tbsp butter
                1 cup cooking cream
                1/2 cup grated parmesan cheese
                1/2 tsp black pepper
                1/2 tsp Italian seasoning
                1/4 cup reserved pasta water
                Salt to taste
                Fresh parsley for garnish
                """,
                """
                Step 1: Bring a large pot of salted water to a boil.
                Step 2: Add pasta and cook according to package instructions until al dente.
                Step 3: Reserve 1/4 cup pasta water, then drain the pasta.
                Step 4: Melt butter in a pan over medium-low heat.
                Step 5: Add chopped garlic and cook for 30–60 seconds without browning it.
                Step 6: Pour in cream and simmer gently for 2–3 minutes.
                Step 7: Reduce heat and stir in parmesan, black pepper and Italian seasoning.
                Step 8: Add cooked pasta and toss until evenly coated. Use reserved pasta water to loosen the sauce if needed.
                Step 9: Taste, adjust salt and serve immediately with parsley.
                """,
                "Italian", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1473093295043-cdd7b7e3b3d1?w=900&fit=crop"
            );

            // 3. CLASSIC PANCAKES
            addRecipe(repository, existingNames,
                "Classic Pancakes",
                "Soft, fluffy homemade pancakes for a delicious breakfast.",
                """
                1 cup all-purpose flour
                1 cup milk
                1 large egg
                2 tbsp sugar
                2 tsp baking powder
                2 tbsp melted butter
                1/4 tsp salt
                1 tsp vanilla extract
                Butter or oil for cooking
                Honey or maple syrup for serving
                """,
                """
                Step 1: In a bowl, mix flour, sugar, baking powder and salt.
                Step 2: In another bowl, whisk milk, egg, melted butter and vanilla.
                Step 3: Pour the wet ingredients into the dry ingredients.
                Step 4: Stir gently until combined. A few small lumps are fine; do not overmix.
                Step 5: Heat a non-stick pan over medium-low heat and lightly grease it.
                Step 6: Pour about 1/4 cup batter for each pancake.
                Step 7: Cook for 2–3 minutes until bubbles appear and the edges begin to set.
                Step 8: Flip and cook for another 1–2 minutes until golden and cooked through.
                Step 9: Serve warm with syrup, fruit or butter.
                """,
                "American", "Breakfast", "Vegetarian",
                "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900&fit=crop"
            );

            // 4. FRESH GREEN SALAD
            addRecipe(repository, existingNames,
                "Fresh Green Salad",
                "A crisp, refreshing salad with vegetables and lemon dressing.",
                """
                2 cups lettuce, washed and chopped
                1 cucumber, sliced
                2 tomatoes, chopped
                1 carrot, grated
                1/2 capsicum, sliced
                2 tbsp olive oil
                1 tbsp fresh lemon juice
                1/2 tsp black pepper
                1/4 tsp salt
                1 tsp honey, optional
                """,
                """
                Step 1: Wash all vegetables thoroughly under running water.
                Step 2: Dry the lettuce and cut it into bite-sized pieces.
                Step 3: Slice cucumber, tomatoes and capsicum. Grate the carrot.
                Step 4: Place all vegetables in a large salad bowl.
                Step 5: In a small bowl, whisk olive oil, lemon juice, pepper, salt and optional honey.
                Step 6: Pour the dressing over the vegetables just before serving.
                Step 7: Toss gently so every vegetable is coated.
                Step 8: Serve immediately for the best freshness and crunch.
                """,
                "International", "Healthy", "Vegetarian",
                "https://images.unsplash.com/photo-1512621776951-a57141f2efd?w=900&fit=crop"
            );

            // 5. CHOCOLATE CAKE
            addRecipe(repository, existingNames,
                "Chocolate Cake",
                "A soft and moist chocolate cake with rich cocoa flavour.",
                """
                1 1/2 cups all-purpose flour
                1 cup sugar
                1/3 cup unsweetened cocoa powder
                1 tsp baking soda
                1/2 tsp baking powder
                1/2 tsp salt
                2 eggs
                1 cup milk
                1/2 cup vegetable oil
                1 tsp vanilla extract
                1/2 cup hot water
                Chocolate frosting, optional
                """,
                """
                Step 1: Preheat the oven to 180°C and grease an 8-inch cake pan.
                Step 2: Mix flour, sugar, cocoa powder, baking soda, baking powder and salt.
                Step 3: In another bowl, whisk eggs, milk, oil and vanilla.
                Step 4: Combine wet and dry ingredients until smooth.
                Step 5: Carefully stir in hot water. The batter will be thin.
                Step 6: Pour batter into the prepared cake pan.
                Step 7: Bake for 30–35 minutes, or until a toothpick inserted in the centre comes out clean.
                Step 8: Let the cake cool in the pan for 10 minutes, then transfer to a rack.
                Step 9: Cool completely before adding chocolate frosting.
                """,
                "American", "Dessert", "Vegetarian",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&fit=crop"
            );

            // 6. MASALA DOSA
            addRecipe(repository, existingNames,
                "Masala Dosa",
                "Crispy South Indian dosa filled with spiced potato masala.",
                """
                2 cups fermented dosa batter
                3 medium potatoes, boiled
                1 onion, thinly sliced
                2 green chillies, chopped
                1/2 tsp mustard seeds
                1/4 tsp turmeric powder
                8 curry leaves
                1 tbsp oil for masala
                Oil or ghee for making dosas
                Salt to taste
                2 tbsp chopped coriander
                """,
                """
                Step 1: Peel the boiled potatoes and mash them roughly.
                Step 2: Heat 1 tbsp oil in a pan and add mustard seeds.
                Step 3: When the seeds splutter, add curry leaves, green chillies and sliced onion.
                Step 4: Sauté until the onion becomes soft.
                Step 5: Add turmeric, mashed potatoes, salt and a few tablespoons of water.
                Step 6: Mix well and cook for 3–4 minutes. Finish with coriander.
                Step 7: Heat a flat dosa pan over medium heat.
                Step 8: Pour a ladle of fermented dosa batter and spread it thinly in circles.
                Step 9: Drizzle oil or ghee around the edges and cook until crisp and golden.
                Step 10: Place potato masala in the centre, fold the dosa and serve with chutney and sambar.
                """,
                "Indian", "Breakfast", "Vegetarian",
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900&fit=crop"
            );

            // 7. PANEER BUTTER MASALA
            addRecipe(repository, existingNames,
                "Paneer Butter Masala",
                "Soft paneer cubes simmered in creamy tomato and butter gravy.",
                """
                250 g paneer, cubed
                3 tomatoes, chopped
                1 onion, chopped
                10 cashew nuts
                2 tbsp butter
                1 tbsp oil
                1 tsp ginger-garlic paste
                1 tsp Kashmiri red chilli powder
                1/2 tsp garam masala
                1/2 tsp cumin powder
                1/4 cup fresh cream
                1 tsp dried fenugreek leaves
                Salt to taste
                """,
                """
                Step 1: Heat oil in a pan and sauté onion until translucent.
                Step 2: Add ginger-garlic paste, tomatoes and cashews.
                Step 3: Cook until tomatoes soften, about 8–10 minutes.
                Step 4: Cool slightly and blend the mixture into a smooth puree.
                Step 5: Melt butter in the pan and add the tomato puree.
                Step 6: Add chilli powder, cumin powder and salt. Cook for 5 minutes.
                Step 7: Add 1/2 cup water and simmer until the gravy thickens.
                Step 8: Add paneer cubes and cook gently for 3–4 minutes.
                Step 9: Stir in cream, garam masala and crushed fenugreek leaves.
                Step 10: Serve hot with naan, roti or jeera rice.
                """,
                "Indian", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&fit=crop"
            );

            // 8. VEGETABLE FRIED RICE
            addRecipe(repository, existingNames,
                "Vegetable Fried Rice",
                "Restaurant-style fried rice with colourful vegetables.",
                """
                3 cups cooked and cooled rice
                1 carrot, finely chopped
                1/2 cup green beans, chopped
                1/2 cup green peas
                1 capsicum, chopped
                3 spring onions, chopped
                3 garlic cloves, minced
                2 tbsp soy sauce
                1 tsp vinegar
                2 tbsp oil
                1/2 tsp black pepper
                Salt to taste
                """,
                """
                Step 1: Cook rice ahead of time and cool completely to prevent sticking.
                Step 2: Wash and finely chop all vegetables.
                Step 3: Heat oil in a large wok over medium-high heat.
                Step 4: Add garlic and the white parts of spring onions. Stir-fry for 30 seconds.
                Step 5: Add carrot, beans, peas and capsicum.
                Step 6: Stir-fry for 4–5 minutes until vegetables are tender-crisp.
                Step 7: Add cooled rice and gently separate any clumps.
                Step 8: Add soy sauce, vinegar, pepper and a little salt.
                Step 9: Toss everything over high heat for 2–3 minutes.
                Step 10: Garnish with spring onion greens and serve hot.
                """,
                "Chinese", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&fit=crop"
            );

            // 9. CHOLE MASALA
            addRecipe(repository, existingNames,
                "Chole Masala",
                "North Indian chickpea curry with aromatic spices.",
                """
                2 cups cooked chickpeas
                2 onions, finely chopped
                2 tomatoes, pureed
                1 tbsp ginger-garlic paste
                2 tbsp oil
                1 tsp cumin seeds
                2 tsp chole masala
                1 tsp coriander powder
                1/2 tsp turmeric
                1/2 tsp red chilli powder
                1/2 tsp garam masala
                1 cup water
                Salt to taste
                Fresh coriander and lemon
                """,
                """
                Step 1: If using dried chickpeas, soak overnight and pressure-cook until soft. Alternatively, use drained canned chickpeas.
                Step 2: Heat oil in a pan and add cumin seeds.
                Step 3: Add onions and sauté until golden.
                Step 4: Stir in ginger-garlic paste and cook for 1 minute.
                Step 5: Add tomato puree and cook until thickened.
                Step 6: Mix in turmeric, chilli powder, coriander powder and chole masala.
                Step 7: Add cooked chickpeas, water and salt.
                Step 8: Simmer for 15–20 minutes, lightly mashing a few chickpeas to thicken the curry.
                Step 9: Add garam masala and coriander.
                Step 10: Serve with bhatura, puri or steamed rice.
                """,
                "Indian", "Main Course", "Vegan",
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&fit=crop"
            );

            // 10. VEGETABLE NOODLES
            addRecipe(repository, existingNames,
                "Vegetable Hakka Noodles",
                "Stir-fried noodles with vegetables and savoury sauce.",
                """
                200 g Hakka noodles
                1 carrot, julienned
                1 capsicum, sliced
                1 cup shredded cabbage
                3 spring onions
                3 garlic cloves, minced
                1 tbsp soy sauce
                1 tsp vinegar
                1 tsp chilli sauce, optional
                2 tbsp oil
                Salt and pepper to taste
                """,
                """
                Step 1: Boil noodles according to package instructions until just cooked.
                Step 2: Drain and rinse briefly under cool water to stop cooking.
                Step 3: Toss noodles with a few drops of oil to prevent sticking.
                Step 4: Heat oil in a wok over high heat.
                Step 5: Add garlic and spring onion whites. Stir-fry briefly.
                Step 6: Add carrot, capsicum and cabbage.
                Step 7: Stir-fry for 3–4 minutes, keeping vegetables slightly crisp.
                Step 8: Add noodles, soy sauce, vinegar and optional chilli sauce.
                Step 9: Toss everything together for 2 minutes and season with pepper.
                Step 10: Garnish with spring onion greens and serve hot.
                """,
                "Chinese", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&fit=crop"
            );

            // 11. IDLI WITH COCONUT CHUTNEY
            addRecipe(repository, existingNames,
                "Idli with Coconut Chutney",
                "Soft steamed South Indian idlis served with fresh coconut chutney.",
                """
                3 cups fermented idli batter
                Oil for greasing moulds

                For coconut chutney:
                1 cup freshly grated coconut
                2 tbsp roasted gram
                1 green chilli
                1/2 inch ginger
                Salt to taste
                Water as needed
                1 tsp oil
                1/2 tsp mustard seeds
                5 curry leaves
                """,
                """
                Step 1: Stir the fermented idli batter gently. Add salt if required.
                Step 2: Grease idli moulds lightly with oil.
                Step 3: Pour batter into each mould, leaving a little space for rising.
                Step 4: Bring water to a boil in an idli steamer.
                Step 5: Place the moulds inside and steam for 10–12 minutes.
                Step 6: Check that a toothpick comes out clean, then rest for 2 minutes before removing idlis.
                Step 7: For chutney, blend coconut, roasted gram, chilli, ginger, salt and water until smooth.
                Step 8: Heat oil, splutter mustard seeds and fry curry leaves.
                Step 9: Pour the tempering over the chutney.
                Step 10: Serve warm idlis with chutney.
                """,
                "Indian", "Breakfast", "Vegetarian",
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900&fit=crop"
            );

            // 12. ALOO PARATHA
            addRecipe(repository, existingNames,
                "Aloo Paratha",
                "Whole-wheat flatbread stuffed with spicy mashed potatoes.",
                """
                2 cups whole-wheat flour
                3 medium potatoes, boiled
                1 green chilli, chopped
                1/2 tsp cumin powder
                1/2 tsp garam masala
                1/2 tsp red chilli powder
                2 tbsp chopped coriander
                Salt to taste
                Water for kneading
                Ghee or oil for cooking
                """,
                """
                Step 1: Mix flour with a pinch of salt and enough water to make a soft dough.
                Step 2: Cover and rest the dough for 15–20 minutes.
                Step 3: Mash boiled potatoes until smooth.
                Step 4: Add chilli, cumin, garam masala, chilli powder, coriander and salt.
                Step 5: Divide the dough and potato filling into equal portions.
                Step 6: Roll one dough ball into a small circle and place potato filling in the centre.
                Step 7: Bring the edges together and seal carefully.
                Step 8: Dust with flour and roll gently into a flat paratha.
                Step 9: Cook on a hot tawa, flipping and applying ghee until golden brown on both sides.
                Step 10: Serve with yogurt or pickle.
                """,
                "Indian", "Breakfast", "Vegetarian",
                "https://commons.wikimedia.org/wiki/Special:FilePath/Idli_with_Coconut_chutney.JPG"
            );

            // 13. MARGHERITA PIZZA
            addRecipe(repository, existingNames,
                "Margherita Pizza",
                "Classic Italian pizza topped with tomato, mozzarella and basil.",
                """
                1 ready-made pizza base, about 10 inches
                1/3 cup pizza tomato sauce
                150 g mozzarella cheese
                6 fresh basil leaves
                1 tbsp olive oil
                1/2 tsp dried oregano
                A pinch of salt
                """,
                """
                Step 1: Preheat the oven to 230°C with a baking tray inside.
                Step 2: Place the pizza base on baking paper.
                Step 3: Spread tomato sauce evenly, leaving a small border.
                Step 4: Tear mozzarella into small pieces and distribute over the sauce.
                Step 5: Sprinkle oregano and a pinch of salt.
                Step 6: Carefully transfer the pizza onto the hot baking tray.
                Step 7: Bake for 10–15 minutes, until the cheese melts and crust becomes golden.
                Step 8: Remove from the oven and add fresh basil leaves.
                Step 9: Drizzle olive oil over the pizza.
                Step 10: Slice and serve hot.
                """,
                "Italian", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&fit=crop"
            );

            // 14. TOMATO SOUP
            addRecipe(repository, existingNames,
                "Creamy Tomato Soup",
                "Comforting homemade tomato soup with garlic and herbs.",
                """
                6 ripe tomatoes, chopped
                1 small onion, chopped
                3 garlic cloves, minced
                1 tbsp olive oil
                2 cups vegetable stock
                1/4 cup fresh cream, optional
                1/2 tsp black pepper
                1/2 tsp dried basil
                Salt to taste
                """,
                """
                Step 1: Heat olive oil in a saucepan over medium heat.
                Step 2: Add chopped onion and sauté until soft.
                Step 3: Add garlic and cook for 30 seconds.
                Step 4: Add chopped tomatoes and cook for 8–10 minutes.
                Step 5: Pour in vegetable stock, add basil and simmer for 15 minutes.
                Step 6: Allow the soup to cool slightly.
                Step 7: Blend carefully until smooth, then return to the saucepan.
                Step 8: Season with salt and black pepper.
                Step 9: Stir in cream if using and warm gently without boiling.
                Step 10: Serve with toasted bread.
                """,
                "International", "Healthy", "Vegetarian",
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&fit=crop"
            );

            // 15. VEGETABLE PULAO
            addRecipe(repository, existingNames,
                "Vegetable Pulao",
                "Fragrant one-pot basmati rice cooked with mixed vegetables.",
                """
                1 1/2 cups basmati rice
                1 cup mixed vegetables (peas, carrots, beans)
                1 onion, sliced
                1 green chilli
                1 tsp ginger-garlic paste
                2 tbsp ghee or oil
                1 bay leaf
                1 cinnamon stick
                3 cloves
                2 cardamom pods
                2 1/2 cups water
                Salt to taste
                """,
                """
                Step 1: Wash rice thoroughly and soak for 20 minutes, then drain.
                Step 2: Heat ghee in a heavy pot.
                Step 3: Add bay leaf, cinnamon, cloves and cardamom.
                Step 4: Add sliced onion and sauté until lightly golden.
                Step 5: Add ginger-garlic paste and green chilli.
                Step 6: Add mixed vegetables and cook for 3 minutes.
                Step 7: Stir in drained rice gently without breaking the grains.
                Step 8: Add water and salt, then bring to a boil.
                Step 9: Cover and cook on low heat for 12–15 minutes until the water is absorbed.
                Step 10: Rest for 10 minutes, fluff gently and serve with raita.
                """,
                "Indian", "Main Course", "Vegetarian",
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&fit=crop"
            );

            // 16. BANANA SMOOTHIE
            addRecipe(repository, existingNames,
                "Banana Smoothie",
                "A creamy banana smoothie made with milk and yogurt.",
                """
                2 ripe bananas
                1 cup chilled milk
                1/2 cup plain yogurt
                1 tsp honey, optional
                1/4 tsp cinnamon
                4 ice cubes
                """,
                """
                Step 1: Peel bananas and cut them into small pieces.
                Step 2: Add banana pieces to a blender.
                Step 3: Pour in chilled milk and yogurt.
                Step 4: Add honey and cinnamon if desired.
                Step 5: Add ice cubes and blend for 30–60 seconds until smooth.
                Step 6: Taste and adjust sweetness.
                Step 7: Pour into glasses and serve immediately.
                """,
                "International", "Healthy", "Vegetarian",
                "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900&fit=crop"
            );

            // 17. CHICKEN CURRY
            addRecipe(repository, existingNames,
                "Indian Chicken Curry",
                "Tender chicken simmered in a traditional onion-tomato gravy.",
                """
                500 g chicken pieces
                2 onions, finely chopped
                2 tomatoes, chopped
                1 tbsp ginger-garlic paste
                2 tbsp oil
                1 tsp cumin seeds
                1 tsp coriander powder
                1/2 tsp turmeric
                1 tsp red chilli powder
                1/2 tsp garam masala
                1 cup water
                Salt to taste
                Fresh coriander
                """,
                """
                Step 1: Wash hands and prepare chicken using a separate cutting board.
                Step 2: Heat oil in a pot and add cumin seeds.
                Step 3: Add onions and sauté until golden brown.
                Step 4: Stir in ginger-garlic paste and cook for 1 minute.
                Step 5: Add tomatoes, turmeric, chilli powder, coriander powder and salt.
                Step 6: Cook until tomatoes soften and oil begins separating from the masala.
                Step 7: Add chicken pieces and stir to coat with spices.
                Step 8: Cook for 5 minutes, then add water.
                Step 9: Cover and simmer for 20–30 minutes, until chicken reaches 74°C internally.
                Step 10: Add garam masala, garnish with coriander and serve with rice or roti.
                """,
                "Indian", "Main Course", "Non-Vegetarian",
                "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&fit=crop"
            );

            // 18. EGG FRIED RICE
            addRecipe(repository, existingNames,
                "Egg Fried Rice",
                "Quick fried rice with scrambled eggs, vegetables and soy sauce.",
                """
                3 cups cooked and cooled rice
                3 eggs
                1 carrot, finely chopped
                1/2 cup peas
                3 spring onions, chopped
                2 garlic cloves, minced
                2 tbsp soy sauce
                2 tbsp oil
                1/2 tsp black pepper
                Salt to taste
                """,
                """
                Step 1: Prepare and cool rice before cooking.
                Step 2: Beat eggs with a pinch of salt.
                Step 3: Heat 1 tbsp oil in a wok and scramble eggs until fully set. Remove to a plate.
                Step 4: Add remaining oil to the wok.
                Step 5: Stir-fry garlic, carrot, peas and spring onion whites for 3–4 minutes.
                Step 6: Add cooled rice and break up clumps.
                Step 7: Pour in soy sauce and add black pepper.
                Step 8: Return scrambled eggs to the wok.
                Step 9: Toss over medium-high heat until everything is hot.
                Step 10: Garnish with spring onion greens and serve immediately.
                """,
                "Chinese", "Main Course", "Non-Vegetarian",
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&fit=crop"
            );

            // 19. FRUIT SALAD
            addRecipe(repository, existingNames,
                "Fresh Fruit Salad",
                "A colourful mix of seasonal fruits with a light citrus dressing.",
                """
                1 apple
                1 banana
                1 orange
                1 cup grapes
                1 cup watermelon cubes
                1/2 cup pomegranate seeds
                1 tbsp lemon juice
                1 tsp honey, optional
                4 mint leaves
                """,
                """
                Step 1: Wash all fruits thoroughly.
                Step 2: Peel the banana and orange.
                Step 3: Remove apple core and cut apple into bite-sized pieces.
                Step 4: Cut banana, orange and watermelon into small pieces.
                Step 5: Halve grapes if serving young children.
                Step 6: Combine all fruits and pomegranate seeds in a large bowl.
                Step 7: Mix lemon juice with optional honey.
                Step 8: Pour dressing over the fruits and toss gently.
                Step 9: Garnish with mint leaves.
                Step 10: Serve fresh or refrigerate briefly before serving.
                """,
                "International", "Healthy", "Vegan",
                "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=900&fit=crop"
            );

            // 20. CHOCOLATE BROWNIES
            addRecipe(repository, existingNames,
                "Chocolate Brownies",
                "Rich, fudgy chocolate brownies with a soft centre.",
                """
                1/2 cup unsalted butter
                150 g dark chocolate
                3/4 cup sugar
                2 eggs
                1 tsp vanilla extract
                3/4 cup all-purpose flour
                2 tbsp cocoa powder
                1/4 tsp salt
                1/3 cup chopped walnuts, optional
                """,
                """
                Step 1: Preheat oven to 175°C and line an 8-inch square pan with baking paper.
                Step 2: Melt butter and chocolate together gently, then cool slightly.
                Step 3: Whisk sugar and eggs until well combined.
                Step 4: Stir in vanilla and the melted chocolate mixture.
                Step 5: Sift flour, cocoa powder and salt into the bowl.
                Step 6: Fold gently until no dry flour remains.
                Step 7: Add chopped walnuts if desired.
                Step 8: Spread batter evenly in the prepared pan.
                Step 9: Bake for 22–28 minutes until the edges are set and a toothpick has moist crumbs rather than wet batter.
                Step 10: Cool completely before cutting into squares.
                """,
                "American", "Dessert", "Vegetarian",
                "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&fit=crop"
            );

            System.out.println("Recipe data loading completed.");
        };
    }

    // Prevent duplicate recipes while adding new ones.
   
private void addRecipe(
        RecipeRepository repository,
        Set<String> existingNames,
        String name,
        String description,
        String ingredients,
        String instructions,
        String cuisine,
        String category,
        String dietary,
        String imageUrl) {

    // Find an existing recipe by its name
    Recipe recipe = repository.findAll()
            .stream()
            .filter(r -> r.getName() != null &&
                    r.getName().trim().equalsIgnoreCase(name.trim()))
            .findFirst()
            .orElse(null);

    if (recipe == null) {
        // Create a new recipe if it does not exist
        recipe = new Recipe();
        System.out.println("Adding new recipe: " + name);
    } else {
        // Update existing recipe without changing its ID
        System.out.println("Updating existing recipe: " + name);
    }

    recipe.setName(name);
    recipe.setDescription(description);
    recipe.setIngredients(ingredients.trim());
    recipe.setInstructions(instructions.trim());
    recipe.setCuisine(cuisine);
    recipe.setCategory(category);
    recipe.setDietary(dietary);
    recipe.setImageUrl(imageUrl);

    repository.save(recipe);

    existingNames.add(name.trim().toLowerCase());



        System.out.println("Added recipe: " + name);
    }
}
