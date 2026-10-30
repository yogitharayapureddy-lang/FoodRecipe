
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api"
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("jwtToken");

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/users/register", data);


export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/users/login", data);

  if (!response.data?.token || !response.data?.user) {
    throw new Error("Invalid login response");
  }

  sessionStorage.setItem("jwtToken", response.data.token);

  return response;
};
export function updateMyRecipe(id: number, data: {
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  cuisine: string;
  category: string;
  dietary: string;
  imageUrl: string;
}) {
  const token = sessionStorage.getItem("jwtToken");

  return fetch(`http://localhost:8081/api/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }
    return response.json();
  });
}

export const logout = async () => {
  sessionStorage.removeItem("jwtToken");
};

export const getCurrentUser = () =>
  api.get("/users/me");

export const getRecipes = () =>
  api.get("/recipes");

export const getRecipe = (id: number) =>
  api.get(`/recipes/${id}`);

export const addRecipe = (data: object) =>
  api.post("/recipes", data);

export const rateRecipe = (id: number, rating: number) =>
  api.post(`/recipes/${id}/rate`, null, {
    params: { rating }
  });

export const getMyRatings = () =>
  api.get("/recipes/ratings/mine");

export const removeRating = (id: number) =>
  api.delete(`/recipes/${id}/rate`);

export const saveRecipe = (id: number) =>
  api.post(`/recipes/${id}/save`);

export const getSavedRecipes = () =>
  api.get("/recipes/saved");

export const removeSavedRecipe = (id: number) =>
  api.delete(`/recipes/${id}/save`);

export const getMyRecipes = () =>
  api.get("/recipes/mine");

export const deleteMyRecipe = (id: number) =>
  api.delete(`/recipes/${id}`);

export const searchRecipes = (keyword: string) =>
  api.get("/recipes/search", {
    params: { keyword }
  });

export default api;
