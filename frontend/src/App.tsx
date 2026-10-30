

import { useEffect, useRef, useState } from "react";
import Donation from "./Donation";
import {

  getRecipes,

  getCurrentUser,

  login,

  register,

  logout,

  addRecipe,

  rateRecipe,

  removeRating,

  saveRecipe,

  removeSavedRecipe,

  getSavedRecipes,

  getMyRatings,

  searchRecipes,

  getMyRecipes,

  deleteMyRecipe,

  updateMyRecipe

} from "./api";

import type { Recipe } from "./types";

import "./style.css";

import CustomizeIngredients from "./CustomizeIngredients";

type RecipeForm = {

  name: string;

  description: string;

  ingredients: string;

  instructions: string;

  cuisine: string;

  category: string;

  dietary: string;

  imageUrl: string;

};

type View = "explore" | "mine" | "saved" | "rated";

type SavedEntry = {

  recipe?: Recipe;

  id?: number;

};

type RatingEntry = {

  recipe?: Recipe;

  recipeId?: number;

  rating: number;

};

const emptyRecipe: RecipeForm = {

  name: "",

  description: "",

  ingredients: "",

  instructions: "",

  cuisine: "",

  category: "",

  dietary: "",

  imageUrl: ""

};

const categories = [

  { name: "All", icon: "🍽️" },

  { name: "Indian", icon: "🍛" },

  { name: "Italian", icon: "🍝" },

  { name: "Breakfast", icon: "🥞" },

  { name: "Dessert", icon: "🍰" },

  { name: "Healthy", icon: "🥗" },

  { name: "Vegetarian", icon: "🥬" }

];

const fallbackImage =

  "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&fit=crop";

function recipeImage(recipe: Recipe): string {

  if (recipe.imageUrl?.trim()) return recipe.imageUrl;

  const name = (recipe.name || "").toLowerCase();

  if (name.includes("biryani"))

    return "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=900&fit=crop";

  if (name.includes("pasta"))

    return "https://images.unsplash.com/photo-1473093295043-cdd7b7e3b3d1?w=900&fit=crop";

  if (name.includes("pancake"))

    return "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900&fit=crop";

  if (name.includes("salad"))

    return "https://images.unsplash.com/photo-1512621776951-a57141f2efd?w=900&fit=crop";

  if (name.includes("cake"))

    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&fit=crop";

  return fallbackImage;

}

function normalizeSaved(data: unknown): Recipe[] {

  if (!Array.isArray(data)) return [];

  const result: Recipe[] = [];

  const seen = new Set<number>();

  for (const item of data as SavedEntry[]) {

    const r = item.recipe || (item as Recipe);

    if (r?.id != null && !seen.has(r.id)) {

      result.push(r);

      seen.add(r.id);

    }

  }

  return result;

}

function App() {

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const [ratedRecipes, setRatedRecipes] = useState<Recipe[]>([]);

  const [view, setView] = useState<View>("explore");

  const [loggedIn, setLoggedIn] = useState(false);

  const [authReady, setAuthReady] = useState(false);

  const [userName, setUserName] = useState("");

  const [showLogin, setShowLogin] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedRecipe, setSelectedRecipe] =

    useState<Recipe | null>(null);

  const [recipe, setRecipe] =

    useState<RecipeForm>({ ...emptyRecipe });

  const [savedIds, setSavedIds] = useState<number[]>([]);

  const [savingIds, setSavingIds] = useState<number[]>([]);

  const [ratings, setRatings] =

    useState<Record<number, number>>({});

  const [ratingBusy, setRatingBusy] =

    useState<number | null>(null);

  const [deletingId, setDeletingId] =

    useState<number | null>(null);

  const [publishing, setPublishing] = useState(false);

  const searchRequest = useRef(0);

  const savingRef = useRef<Set<number>>(new Set());

  const [editingRecipeId, setEditingRecipeId] =

  useState<number | null>(null);

const [editRecipe, setEditRecipe] =

  useState<RecipeForm>({ ...emptyRecipe });

const [updatingRecipe, setUpdatingRecipe] =

  useState(false);

  function notify(text: string) {

    setMessage(text);

  }

  function scrollTo(id: string) {

    document.getElementById(id)?.scrollIntoView({

      behavior: "smooth",

      block: "start"

    });

  }

  function resetFilters() {

    setSearch("");

    setActiveCategory("All");

    setView("explore");

  }

  function clearUserState() {

    setLoggedIn(false);

    setUserName("");

    setMyRecipes([]);

    setSavedRecipes([]);

    setRatedRecipes([]);

    setSavedIds([]);

    setSavingIds([]);

    setRatings({});

    setSelectedRecipe(null);

    savingRef.current.clear();

  }

  async function loadRecipes() {

    try {

      const response = await getRecipes();

      setRecipes(response.data);

    } catch (error) {

      console.error(error);

      notify("Could not load recipes. Check your backend.");

    }

  }

  async function loadMyRecipes() {

    try {

      const response = await getMyRecipes();

      const items: Recipe[] = response.data;

      setMyRecipes(

        [...items].sort(

          (a, b) => (b.id || 0) - (a.id || 0)

        )

      );

    } catch (error) {

      console.error(error);

      notify("Could not load My Recipes.");

    }

  }

  async function loadSavedRecipes() {

    try {

      const response = await getSavedRecipes();

      const items = normalizeSaved(response.data);

      setSavedRecipes(items);

      setSavedIds(

        items

          .map(r => r.id)

          .filter((id): id is number => id != null)

      );

    } catch (error) {

      console.error("Saved recipes error:", error);

    }

  }

  async function loadMyRatings() {

    try {

      const response = await getMyRatings();

      const values: Record<number, number> = {};

      for (const item of response.data as RatingEntry[]) {

        const id = item.recipe?.id ?? item.recipeId;

        if (id != null) {

          values[id] = item.rating;

        }

      }

      setRatings(values);

    } catch (error) {

      console.error("Ratings error:", error);

    }

  }

  async function loadRatedRecipes() {

    try {

      const response = await getMyRatings();

      const values: Record<number, number> = {};

      const items: Recipe[] = [];

      const seen = new Set<number>();

      for (const item of response.data as RatingEntry[]) {

        const r = item.recipe;

        const id = r?.id;

        if (r == null || id == null) continue;

        values[id] = item.rating;

        if (!seen.has(id)) {

          items.push(r);

          seen.add(id);

        }

      }

      setRatings(values);

      setRatedRecipes(items);

    } catch (error) {

      console.error(error);

      notify("Could not load rated recipes.");

    }

  }

  // JWT: restore login after refreshing the page

  useEffect(() => {

    let cancelled = false;

    async function initialize() {

      await loadRecipes();

      const token = sessionStorage.getItem("jwtToken");

      if (!token) {

        if (!cancelled) setAuthReady(true);

        return;

      }

      try {

        const response = await getCurrentUser();

        if (cancelled) return;

        setLoggedIn(true);

        setUserName(response.data.name || "Chef");

        await Promise.all([

          loadSavedRecipes(),

          loadMyRatings()

        ]);

      } catch (error) {

        console.error("JWT authentication failed:", error);

        if (!cancelled) {

          sessionStorage.removeItem("jwtToken");

          clearUserState();

        }

      } finally {

        if (!cancelled) setAuthReady(true);

      }

    }

    initialize();

    return () => {

      cancelled = true;

    };

  }, []);

  useEffect(() => {

    if (view !== "explore") return;

    const timer = window.setTimeout(() => {

      performSearch(search, activeCategory);

    }, 350);

    return () => window.clearTimeout(timer);

  }, [search, activeCategory, view]);

  async function performSearch(

    keyword: string,

    category: string

  ) {

    const requestId = ++searchRequest.current;

    setLoading(true);

    try {

      const value = keyword.trim();

      const response = value

        ? await searchRecipes(value)

        : await getRecipes();

      let result: Recipe[] = response.data;

      if (category !== "All") {

        const term = category.toLowerCase();

        result = result.filter(r =>

          [

            r.cuisine,

            r.category,

            r.dietary,

            r.name,

            r.description

          ].some(field =>

            (field || "").toLowerCase().includes(term)

          )

        );

      }

      if (requestId === searchRequest.current) {

        setRecipes(result);

      }

    } catch (error) {

      console.error(error);

      notify("Search failed.");

    } finally {

      if (requestId === searchRequest.current) {

        setLoading(false);

      }

    }

  }

  async function handleRegister() {

    if (!name.trim() || !email.trim() || !password.trim()) {

      notify("Please fill in all account details.");

      return;

    }

    if (password.length < 8) {

      notify("Password must contain at least 8 characters.");

      return;

    }

    try {

      await register({

        name: name.trim(),

        email: email.trim(),

        password

      });

      setShowLogin(true);

      setPassword("");

      notify("Account created! Please log in.");

    } catch (error) {

      console.error(error);

      notify("Registration failed. Email may already exist.");

    }

  }

  // JWT: login stores token through api.ts

  async function handleLogin() {

    if (!email.trim() || !password.trim()) {

      notify("Enter your email and password.");

      return;

    }

    try {

      const response = await login({

        email: email.trim(),

        password

      });

      setLoggedIn(true);

      setUserName(response.data.user.name || "Chef");

      setPassword("");

      await Promise.all([

        loadSavedRecipes(),

        loadMyRatings()

      ]);

      resetFilters();

      notify("Welcome back!");

      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

    } catch (error) {

      console.error(error);

      notify("Login failed. Check your credentials.");

    }

  }

  // JWT: logout removes token

  async function handleLogout() {

    await logout();

    clearUserState();

    resetFilters();

    notify("You have been logged out.");

  }

  async function handleAddRecipe() {

    if (!loggedIn) {

      notify("Please log in first.");

      return;

    }

    if (

      !recipe.name.trim() ||

      !recipe.ingredients.trim() ||

      !recipe.instructions.trim()

    ) {

      notify("Name, ingredients and instructions are required.");

      return;

    }

    if (publishing) return;

    setPublishing(true);

    try {

      await addRecipe(recipe);

      setRecipe({ ...emptyRecipe });

      setSearch("");

      setActiveCategory("All");

      await Promise.all([

        loadRecipes(),

        loadMyRecipes()

      ]);

      setView("mine");

      notify("Recipe published successfully!");

      window.setTimeout(() => scrollTo("recipes"), 50);

    } catch (error) {

      console.error(error);

      notify("Unable to publish recipe.");

    } finally {

      setPublishing(false);

    }

  }

  function startEditRecipe(item: Recipe) {

  if (!loggedIn || view !== "mine" || item.id == null) return;

  setEditingRecipeId(item.id);

  setEditRecipe({

    name: item.name || "",

    description: item.description || "",

    ingredients: item.ingredients || "",

    instructions: item.instructions || "",

    cuisine: item.cuisine || "",

    category: item.category || "",

    dietary: item.dietary || "",

    imageUrl: item.imageUrl || ""

  });

  setSelectedRecipe(null);

}

function cancelEditRecipe() {

  setEditingRecipeId(null);

  setEditRecipe({ ...emptyRecipe });

}

async function handleUpdateRecipe() {

  if (editingRecipeId === null || updatingRecipe) return;

  if (

    !editRecipe.name.trim() ||

    !editRecipe.ingredients.trim() ||

    !editRecipe.instructions.trim()

  ) {

    notify("Name, ingredients and instructions are required.");

    return;

  }

  setUpdatingRecipe(true);

  try {

    const updateResponse = await updateMyRecipe(editingRecipeId, editRecipe);
    const updated: Recipe = (updateResponse as unknown as { data?: Recipe }).data ?? (updateResponse as unknown as Recipe);

    const replaceRecipe = (items: Recipe[]) =>

      items.map(item =>

        item.id === updated.id ? updated : item

      );

    setMyRecipes(replaceRecipe);

    setRecipes(replaceRecipe);

    setSavedRecipes(replaceRecipe);

    setRatedRecipes(replaceRecipe);

    cancelEditRecipe();

    notify("Recipe updated successfully!");

    await Promise.all([loadMyRecipes(), loadRecipes()]);

  } catch (error) {

    console.error(error);

    notify("Could not update recipe. Check login and ownership.");

  } finally {

    setUpdatingRecipe(false);

  }

}

  async function handleDeleteMyRecipe(id: number) {

    if (!loggedIn || deletingId !== null) return;

    const confirmed = window.confirm(

      "Delete this recipe permanently? Saved entries and ratings will also be removed."

    );

    if (!confirmed) return;

    setDeletingId(id);

    try {

      await deleteMyRecipe(id);

      setMyRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      setRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      setSavedRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      setRatedRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      setSavedIds(previous =>

        previous.filter(savedId => savedId !== id)

      );

      setRatings(previous => {

        const updated = { ...previous };

        delete updated[id];

        return updated;

      });

      if (selectedRecipe?.id === id) {

        setSelectedRecipe(null);

      }

      notify("Recipe deleted successfully!");

    } catch (error) {

      console.error(error);

      notify("Could not delete recipe.");

    } finally {

      setDeletingId(null);

    }

  }

  async function handleRate(id: number, stars: number) {

    if (!loggedIn) {

      notify("Please log in to rate recipes.");

      scrollTo("auth");

      return;

    }

    if (ratingBusy !== null) return;

    setRatingBusy(id);

    try {

      await rateRecipe(id, stars);

      setRatings(previous => ({

        ...previous,

        [id]: stars

      }));

      if (view === "rated") {

        await loadRatedRecipes();

      }

      notify(`You rated this recipe ${stars}/5.`);

    } catch (error) {

      console.error(error);

      notify("Unable to save rating.");

    } finally {

      setRatingBusy(null);

    }

  }

  async function handleRemoveRating(id: number) {

    if (!loggedIn || ratingBusy !== null) return;

    setRatingBusy(id);

    try {

      await removeRating(id);

      setRatings(previous => {

        const updated = { ...previous };

        delete updated[id];

        return updated;

      });

      setRatedRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      notify("Rating removed successfully.");

    } catch (error) {

      console.error(error);

      notify("Could not remove rating.");

    } finally {

      setRatingBusy(null);

    }

  }

  async function handleSave(id: number) {

    if (!loggedIn) {

      notify("Please log in to save recipes.");

      scrollTo("auth");

      return;

    }

    if (savingRef.current.has(id)) return;

    if (savedIds.includes(id)) {

      notify("This recipe is already saved.");

      return;

    }

    savingRef.current.add(id);

    setSavingIds(previous => [...previous, id]);

    try {

      await saveRecipe(id);

      await loadSavedRecipes();

      notify("Recipe saved!");

    } catch (error) {

      console.error(error);

      notify("Could not save recipe.");

      await loadSavedRecipes();

    } finally {

      savingRef.current.delete(id);

      setSavingIds(previous =>

        previous.filter(item => item !== id)

      );

    }

  }

  async function handleRemoveSaved(id: number) {

    if (!loggedIn || savingRef.current.has(id)) return;

    savingRef.current.add(id);

    setSavingIds(previous => [...previous, id]);

    try {

      await removeSavedRecipe(id);

      setSavedIds(previous =>

        previous.filter(item => item !== id)

      );

      setSavedRecipes(previous =>

        previous.filter(r => r.id !== id)

      );

      notify("Recipe removed from saved collection.");

    } catch (error) {

      console.error(error);

      notify("Could not remove saved recipe.");

    } finally {

      savingRef.current.delete(id);

      setSavingIds(previous =>

        previous.filter(item => item !== id)

      );

    }

  }

  async function showMyRecipes() {

    if (!loggedIn) return;

    await loadMyRecipes();

    setView("mine");

    window.setTimeout(() => scrollTo("recipes"), 50);

  }

  async function showSaved() {

    if (!loggedIn) return;

    await loadSavedRecipes();

    setView("saved");

    window.setTimeout(() => scrollTo("recipes"), 50);

  }

  async function showRated() {

    if (!loggedIn) return;

    await loadRatedRecipes();

    setView("rated");

    window.setTimeout(() => scrollTo("recipes"), 50);

  }

  function handleShareRecipe() {

    if (loggedIn) {

      scrollTo("add");

    } else {

      notify("Log in to share your recipe.");

      scrollTo("auth");

    }

  }

  function SaveButton({

    item,

    image = false

  }: {

    item: Recipe;

    image?: boolean;

  }) {

    const id = item.id;

    const saved = id != null && savedIds.includes(id);

    const busy = id != null && savingIds.includes(id);

    const canRemove = saved && view === "saved";

    function onClick() {

      if (id == null || busy) return;

      if (canRemove) {

        handleRemoveSaved(id);

      } else if (!saved) {

        handleSave(id);

      }

    }

    if (image) {

      return (

        <button

          type="button"

          className={saved ? "image-save saved" : "image-save"}

          disabled={busy || id == null || (saved && !canRemove)}

          onClick={onClick}

          title={canRemove ? "Remove from saved" : "Save recipe"}

        >

          {saved ? "♥" : "♡"}

        </button>

      );

    }

    return (

      <button

        type="button"

        className={

          canRemove

            ? "save-text-btn remove-saved"

            : saved

              ? "save-text-btn already-saved"

              : "save-text-btn"

        }

        disabled={busy || id == null || (saved && !canRemove)}

        onClick={onClick}

      >

        {busy

          ? "Please wait..."

          : canRemove

            ? "✕ Remove"

            : saved

              ? "♥ Saved"

              : "♡ Save"}

      </button>

    );

  }

  function RatingControl({ item }: { item: Recipe }) {

    const id = item.id;

    const value = id != null ? ratings[id] || 0 : 0;

    return (

      <div className="professional-rating">

        <div className="rating-heading">

          <span>Your rating</span>

          {value ? (

            <span className="rated-label">

              ✓ Rated {value}/5

            </span>

          ) : (

            <span className="unrated-label">

              Not rated yet

            </span>

          )}

        </div>

        <div className="professional-stars">

          {[1, 2, 3, 4, 5].map(star => (

            <button

              key={star}

              type="button"

              className={

                star <= value

                  ? "professional-star active"

                  : "professional-star"

              }

              disabled={id == null || ratingBusy !== null}

              onClick={() => id != null && handleRate(id, star)}

              aria-label={`Rate ${star} out of 5`}

            >

              ★

            </button>

          ))}

        </div>

        <p className="rating-helper">

          {ratingBusy === id

            ? "Saving rating..."

            : value

              ? "Click another star to change your rating"

              : "Click a star to rate this recipe"}

        </p>

        {loggedIn &&

          view === "rated" &&

          id != null &&

          value > 0 && (

            <button

              type="button"

              className="remove-rating-btn"

              disabled={ratingBusy !== null}

              onClick={() => handleRemoveRating(id)}

            >

              ✕ Remove Rating

            </button>

          )}

      </div>

    );

  }

  const visibleRecipes =

    view === "mine"

      ? myRecipes

      : view === "saved"

        ? savedRecipes

        : view === "rated"

          ? ratedRecipes

          : recipes;

  const heading =

    view === "mine"

      ? "My Recipes"

      : view === "saved"

        ? "Your saved recipes"

        : view === "rated"

          ? "Your rated recipes"

          : search

            ? `Results for "${search}"`

            : activeCategory !== "All"

              ? `${activeCategory} recipes`

              : "Explore recipes";

  return (

    <div className="app">

      <header className="site-header">

        <nav className="navbar">

          <button

            className="brand"

            onClick={() => {

              resetFilters();

              scrollTo("home");

            }}

          >

            <span className="brand-icon">✳</span>

            recipe<span>hub.</span>

          </button>

          <div className="nav-links">

            <button

              onClick={() => {

                resetFilters();

                scrollTo("home");

              }}

            >

              Home

            </button>

            <button

              onClick={() => {

                resetFilters();

                scrollTo("recipes");

              }}

            >

              Explore

            </button>

            <button onClick={handleShareRecipe}>

              Share Recipe

            </button>

            {loggedIn && (

              <>

                <button onClick={showMyRecipes}>

                  📖 My Recipes

                </button>

                <button onClick={showSaved}>

                  Saved Recipes

                </button>
                

                 <button onClick={showRated}>
      ★ Rated Recipes
    </button>

  </>

            )}

          </div>

          <div className="nav-right">

            {loggedIn ? (

              <div className="user-navbar">

                <span className="welcome-user">

                  👋 Welcome, <strong>{userName}</strong>

                </span>

                <button

                  className="nav-auth"

                  onClick={handleLogout}

                >

                  Log out

                </button>

              </div>

            ) : (

              <button

                className="nav-auth"

                onClick={() => scrollTo("auth")}

              >

                Sign in →

              </button>

            )}

          </div>

        </nav>

      </header>

      {message && (

        <div className="toast" role="status">

          <span>{message}</span>

          <button onClick={() => setMessage("")}>

            ×

          </button>

        </div>

      )}

      <section className="hero" id="home">

        <div className="hero-inner">

          <div className="hero-content animate-up">

            <div className="eyebrow">

              <span className="eyebrow-dot" />

              MADE FOR PEOPLE WHO LOVE FOOD

            </div>

            <h1>

              Good food.

              <br />

              <em>Great stories.</em>

            </h1>

            <p className="hero-description">

              Discover recipes worth making, save your favorites,

              and share the dishes that bring people together.

            </p>

            <div className="hero-buttons">

              <button

                className="btn-primary"

                onClick={() => scrollTo("recipes")}

              >

                Explore recipes ↗

              </button>

              <button

                className="btn-outline"

                onClick={handleShareRecipe}

              >

                Share your recipe

              </button>

            </div>

            <div className="hero-note">

              <span>✦</span>

              Discover something delicious today

            </div>

          </div>

          <div className="hero-visual animate-image">

            <img

              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&fit=crop"

              alt="Freshly prepared food"

            />

            <div className="hero-image-label">

              <span>FRESH INSPIRATION</span>

              <strong>Made with love.</strong>

            </div>

          </div>

        </div>

      </section>

      <section className="search-area" id="search">

        <div className="search-container">

          <div className="search-title">

            <span className="section-kicker">

              FIND YOUR NEXT FAVORITE

            </span>

            <h2>What are we cooking today?</h2>

          </div>

          <div className="search-field">

            <span className="search-symbol">⌕</span>

            <input

              type="search"

              placeholder="Search recipes, ingredients, cuisines..."

              value={search}

              onChange={e => {

                setView("explore");

                setSearch(e.target.value);

              }}

              onKeyDown={e => {

                if (e.key === "Enter") scrollTo("recipes");

              }}

            />

            {search && (

              <button

                className="search-clear"

                onClick={() => setSearch("")}

              >

                ×

              </button>

            )}

            <button

              className="search-submit"

              onClick={() => {

                setView("explore");

                performSearch(search, activeCategory);

                scrollTo("recipes");

              }}

            >

              Search →

            </button>

          </div>

          <div className="category-pills">

            {categories.map(category => (

              <button

                key={category.name}

                className={

                  activeCategory === category.name

                    ? "category-pill active"

                    : "category-pill"

                }

                onClick={() => {

                  setView("explore");

                  setActiveCategory(category.name);

                  scrollTo("recipes");

                }}

              >

                <span>{category.icon}</span>{" "}

                {category.name}

              </button>

            ))}

          </div>

        </div>

      </section>

      <section className="recipes-section" id="recipes">

        <div className="section-top">

          <div>

            <span className="section-kicker">

              {view === "mine"

                ? "YOUR CREATIONS"

                : view === "saved"

                  ? "YOUR COLLECTION"

                  : view === "rated"

                    ? "YOUR REVIEWS"

                    : "DISCOVER & ENJOY"}

            </span>

            <h2>{heading}</h2>

            <p>

              {view === "mine"

                ? "Recipes you published, newest first."

                : view === "saved"

                  ? "All the delicious recipes you've saved."

                  : view === "rated"

                    ? "Recipes you've rated."

                    : "Handpicked inspiration for your next meal."}

            </p>

          </div>

          <div className="collection-count">

            {loading && view === "explore"

              ? "Searching..."

              : `${visibleRecipes.length} recipes`}

          </div>

        </div>

        {visibleRecipes.length === 0 ? (

          <div className="empty-state">

            <div className="empty-symbol">

              {view === "mine" ? "📖" : "♡"}

            </div>

            <h3>

              {view === "mine"

                ? "No recipes added yet"

                : view === "saved"

                  ? "No saved recipes yet"

                  : view === "rated"

                    ? "No rated recipes yet"

                    : "No recipes found"}

            </h3>

            <p>

              {view === "mine"

                ? "Publish your first recipe to see it here."

                : "Explore recipes and start your collection."}

            </p>

            <button

              className="btn-primary"

              onClick={() => {

                resetFilters();

                scrollTo("recipes");

              }}

            >

              Browse all recipes →

            </button>

          </div>

        ) : (

          <div className="recipe-grid">

            {visibleRecipes.map(r => (

              <article className="recipe-card" key={r.id}>

                <div className="recipe-image">

                  <img

                    src={recipeImage(r)}

                    alt={r.name}

                    loading="lazy"

                    onError={e => {

                      if (e.currentTarget.src !== fallbackImage) {

                        e.currentTarget.src = fallbackImage;

                      }

                    }}

                  />

                  <span className="image-tag">

                    {r.cuisine || "Homemade"}

                  </span>

                  <SaveButton item={r} image />

                </div>

                <div className="recipe-body">

                  <div className="recipe-label">

                    {r.category || "RECIPE"} •{" "}

                    {r.dietary || "HOMEMADE"}

                  </div>

                  <h3>{r.name}</h3>

                  <p className="recipe-description">

                    {r.description ||

                      "A delicious recipe to try at home."}

                  </p>

                  <RatingControl item={r} />

                  {view === "mine" && r.id != null && (
  <div className="my-recipe-actions">
    <button type="button" className="edit-recipe-btn" onClick={() => startEditRecipe(r)}>
      ✎ Edit Recipe
    </button>
    <button type="button" className="delete-recipe-btn"
      disabled={deletingId !== null} onClick={() => handleDeleteMyRecipe(r.id!)}>
      {deletingId === r.id ? "Deleting..." : "✕ Delete Recipe"}
    </button>
  </div>
)}

                  <div className="recipe-bottom">

                    <button

                      className="view-recipe-btn"

                      onClick={() => setSelectedRecipe(r)}

                    >

                      View recipe ↗

                    </button>

                    <SaveButton item={r} />

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {loggedIn && (

        <section className="add-section" id="add">

          <div className="add-container">

            <div className="add-info">

              <span className="section-kicker">

                FROM YOUR KITCHEN

              </span>

              <h2>

                Something delicious

                <br />

                <em>to share?</em>

              </h2>

              <p>

                Every great recipe has a story.

                Share yours with our community of food lovers.

              </p>

              <div className="add-decoration">✳</div>

            </div>

            <div className="recipe-form">

              <h3>Publish a recipe</h3>

              <p>Tell us what makes your dish special.</p>

              <label>Recipe name *</label>

              <input

                placeholder="e.g. Homemade Chicken Biryani"

                value={recipe.name}

                onChange={e =>

                  setRecipe({

                    ...recipe,

                    name: e.target.value

                  })

                }

              />

              <label>Description</label>

              <input

                placeholder="A short introduction to your dish"

                value={recipe.description}

                onChange={e =>

                  setRecipe({

                    ...recipe,

                    description: e.target.value

                  })

                }

              />

              <label>Ingredients *</label>

              <textarea

                rows={4}

                placeholder="List your ingredients..."

                value={recipe.ingredients}

                onChange={e =>

                  setRecipe({

                    ...recipe,

                    ingredients: e.target.value

                  })

                }

              />

              <label>Cooking instructions *</label>

              <textarea

                rows={5}

                placeholder="Explain the preparation steps..."

                value={recipe.instructions}

                onChange={e =>

                  setRecipe({

                    ...recipe,

                    instructions: e.target.value

                  })

                }

              />

              <div className="form-row">

                <div>

                  <label>Cuisine</label>

                  <input

                    placeholder="Indian, Italian..."

                    value={recipe.cuisine}

                    onChange={e =>

                      setRecipe({

                        ...recipe,

                        cuisine: e.target.value

                      })

                    }

                  />

                </div>

                <div>

                  <label>Category</label>

                  <input

                    placeholder="Breakfast, Dessert..."

                    value={recipe.category}

                    onChange={e =>

                      setRecipe({

                        ...recipe,

                        category: e.target.value

                      })

                    }

                  />

                </div>

              </div>

              <div className="form-row">

                <div>

                  <label>Dietary preference</label>

                  <input

                    placeholder="Vegetarian, Vegan..."

                    value={recipe.dietary}

                    onChange={e =>

                      setRecipe({

                        ...recipe,

                        dietary: e.target.value

                      })

                    }

                  />

                </div>

                <div>

                  <label>Image URL</label>

                  <input

                    placeholder="https://..."

                    value={recipe.imageUrl}

                    onChange={e =>

                      setRecipe({

                        ...recipe,

                        imageUrl: e.target.value

                      })

                    }

                  />

                </div>

              </div>

              <button

                className="btn-primary publish-btn"

                disabled={publishing}

                onClick={handleAddRecipe}

              >

                {publishing

                  ? "Publishing..."

                  : "Publish recipe →"}

              </button>

            </div>

          </div>

        </section>

      )}

      {authReady && !loggedIn && (

        <section className="auth-section" id="auth">

          <div className="auth-layout">

            <div className="auth-intro">

              <span className="section-kicker">

                JOIN THE COMMUNITY

              </span>

              <h2>

                Your kitchen.

                <br />

                <em>Your community.</em>

              </h2>

              <p>

                Create an account to save your favorite recipes,

                rate dishes, and share your cooking creations.

              </p>

            </div>

            <div className="auth-card">

              <div className="auth-card-icon">✳</div>

              <h3>

                {showLogin

                  ? "Welcome back"

                  : "Create an account"}

              </h3>

              <p>

                {showLogin

                  ? "Sign in to continue your cooking journey."

                  : "Join the RecipeHub community today."}

              </p>

              {!showLogin && (

                <>

                  <label>Your name</label>

                  <input

                    placeholder="Enter your name"

                    value={name}

                    onChange={e => setName(e.target.value)}

                  />

                </>

              )}

              <label>Email address</label>

              <input

                type="email"

                placeholder="you@example.com"

                value={email}

                onChange={e => setEmail(e.target.value)}

              />

              <label>Password</label>

              <input

                type="password"

                placeholder="Enter your password"

                value={password}

                onChange={e => setPassword(e.target.value)}

                onKeyDown={e => {

                  if (e.key === "Enter") {

                    if (showLogin) handleLogin();

                    else handleRegister();

                  }

                }}

              />

              <button

                className="btn-primary auth-submit"

                onClick={

                  showLogin ? handleLogin : handleRegister

                }

              >

                {showLogin

                  ? "Sign in →"

                  : "Create account →"}

              </button>

              <div className="auth-switch">

                {showLogin

                  ? "Don't have an account?"

                  : "Already have an account?"}

                <button

                  onClick={() => setShowLogin(!showLogin)}

                >

                  {showLogin ? "Sign up" : "Sign in"}

                </button>

              </div>

            </div>

          </div>

        </section>

      )}

     {/* EDIT RECIPE POPUP */}
{editingRecipeId !== null && (
  <div className="modal-overlay" onClick={() => { if (!updatingRecipe) cancelEditRecipe(); }}>
    <div className="recipe-modal edit-recipe-modal" role="dialog" aria-modal="true"
      aria-label="Edit Recipe" onClick={e => e.stopPropagation()}
      style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
      <button type="button" className="modal-close" disabled={updatingRecipe}
        onClick={cancelEditRecipe}>×</button>
      <div className="recipe-form" style={{ width: "100%" }}>
        <span className="section-kicker">YOUR CREATION</span>
        <h2>✎ Edit Recipe</h2>
        <p>Update your recipe details and save your changes.</p>
        {([
          ["name", "Recipe name *"],
          ["description", "Description"],
          ["ingredients", "Ingredients *"],
          ["instructions", "Cooking instructions *"],
          ["cuisine", "Cuisine"],
          ["category", "Category"],
          ["dietary", "Dietary preference"],
          ["imageUrl", "Image URL"]
        ] as [keyof RecipeForm, string][]).map(([field, label]) => (
          <div key={field} style={{ marginBottom: 14 }}>
            <label htmlFor={`edit-${field}`}>{label}</label>
            {field === "description" || field === "ingredients" || field === "instructions" ? (
              <textarea id={`edit-${field}`} rows={field === "instructions" ? 6 : 4}
                value={editRecipe[field]}
                onChange={e => setEditRecipe(previous => ({ ...previous, [field]: e.target.value }))} />
            ) : (
              <input id={`edit-${field}`} type="text" value={editRecipe[field]}
                onChange={e => setEditRecipe(previous => ({ ...previous, [field]: e.target.value }))} />
            )}
          </div>
        ))}
        <div className="my-recipe-actions" style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button type="button" className="btn-outline" disabled={updatingRecipe}
            onClick={cancelEditRecipe}>Cancel</button>
          <button type="button" className="btn-primary" disabled={updatingRecipe}
            onClick={handleUpdateRecipe}>
            {updatingRecipe ? "Saving..." : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* EXISTING VIEW RECIPE POPUP */}

{selectedRecipe && (

  <div

    className="modal-overlay"

    onClick={() => setSelectedRecipe(null)}

  >

    <div

      className="recipe-modal"

      role="dialog"

      aria-modal="true"

      aria-label={selectedRecipe.name}

      onClick={e => e.stopPropagation()}

    >

      <button

        type="button"

        className="modal-close"

        onClick={() => setSelectedRecipe(null)}

      >

        ×

      </button>

      {/* Keep your existing photo, ingredients,

          instructions, ratings and buttons here */}

      <div className="modal-photo">

        <img

          src={recipeImage(selectedRecipe)}

          alt={selectedRecipe.name}

          onError={e => {

            if (e.currentTarget.src !== fallbackImage) {

              e.currentTarget.src = fallbackImage;

            }

          }}

        />

      </div>

      <div className="modal-content">

        <span className="section-kicker">

          {selectedRecipe.cuisine || "HOMEMADE"} •{" "}

          {selectedRecipe.category || "RECIPE"}

        </span>

        <h2>{selectedRecipe.name}</h2>

        <p className="modal-description">

          {selectedRecipe.description}

        </p>

        <div className="modal-divider" />

        {loggedIn ? (

          <CustomizeIngredients

            ingredients={selectedRecipe.ingredients || ""}

            instructions={selectedRecipe.instructions || ""}

            recipeId={selectedRecipe.id}

          />

        ) : (

          <div className="guest-recipe-details">

            <h3>Ingredients</h3>

            <div

              className="recipe-detail-text"

              style={{ whiteSpace: "pre-line" }}

            >

              {selectedRecipe.ingredients}

            </div>

            <h3>Instructions</h3>

            <div

              className="recipe-detail-text"

              style={{ whiteSpace: "pre-line" }}

            >

              {selectedRecipe.instructions}

            </div>

            <p className="login-customize-message">

              🔒 Please sign in to customize this recipe.

            </p>

          </div>

        )}

        <div className="modal-divider" />

        <RatingControl item={selectedRecipe} />

        <div className="modal-save">

          <SaveButton item={selectedRecipe} />

        </div>

        {view === "mine" &&

          selectedRecipe.id != null &&

          myRecipes.some(

            recipe => recipe.id === selectedRecipe.id

          ) && (

            <div className="my-recipe-actions">

              <button

                type="button"

                className="edit-recipe-btn"

                onClick={() =>

                  startEditRecipe(selectedRecipe)

                }

              >

                ✎ Edit Recipe

              </button>

              <button

                type="button"

                className="delete-recipe-btn"

                disabled={deletingId !== null}

                onClick={() =>

                  handleDeleteMyRecipe(selectedRecipe.id!)

                }

              >

                {deletingId === selectedRecipe.id

                  ? "Deleting..."

                  : "✕ Delete Recipe"}

              </button>

            </div>

          )}
          {/* DONATION TO RECIPE CREATOR */}
{selectedRecipe.id != null && (
  <div className="recipe-donation-container">
    <Donation
      key={selectedRecipe.id}
      recipeId={selectedRecipe.id}
      recipeName={selectedRecipe.name}
      creatorName={
        (selectedRecipe as Recipe & {
          user?: { name?: string };
        }).user?.name || "Recipe Creator"
      }
    />
  </div>
)}

      </div>

    </div>

  </div>

)}

      <footer className="footer">

        <div className="footer-inner">

          <div>

            <div className="footer-brand">

              ✳ recipe<span>hub.</span>

            </div>

            <p>Good food is meant to be shared.</p>

          </div>

          <div className="footer-right">

            <span>Discover. Cook. Share.</span>

            <small>

              © 2026 RecipeHub. All rights reserved.

            </small>

          </div>

        </div>

      </footer>

    </div>

  );

}

export default App;
