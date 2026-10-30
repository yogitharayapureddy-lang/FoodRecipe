export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Recipe {
    id?: number;
    name: string;
    description: string;
    ingredients: string;
    instructions: string;
    cuisine: string;
    category: string;
    dietary: string;
    imageUrl: string;
}

export interface Rating {
    id: number;
    rating: number;
}