import "reflect-metadata";

import { DataSource } from "typeorm";

import { Ingredient } from "./entity/ingredient";
import { IngredientInRecipe } from "./entity/ingredient-in-recipe";
import { Recipe } from "./entity/recipe";
import { User } from "./entity/user";

export const RecipesSource = new DataSource({
    type: "postgres",
    host: import.meta.env.VITE_DATABASE_HOST,
    port: parseInt(import.meta.env.VITE_DATABASE_PORT, 10),
    username: import.meta.env.VITE_DATABASE_USER,
    password: import.meta.env.VITE_DATABASE_PASSWORD,
    database: import.meta.env.VITE_DATABASE_NAME,
    logger: "advanced-console",
    logging: "all",
    synchronize: true,
    entities: [Ingredient, User, Recipe, IngredientInRecipe],
});
