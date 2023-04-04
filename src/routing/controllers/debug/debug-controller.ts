import { IncomingMessage, ServerResponse } from "http";

import { Ingredient } from "../../../entity/ingredient";
import { IngredientInRecipe } from "../../../entity/ingredient-in-recipe";
import { Recipe } from "../../../entity/recipe";
import { User } from "../../../entity/user";
import { Unit } from "../../../utility/unit";
import { Controller } from "../../controller";
import { Route, Routes } from "../../decorators/routes";
import { JWT } from "../../security/jwt";

@Routes
export class DebugController extends Controller {
    constructor() {
        super("/debug");
    }

    @Route("GET", "/get-token/")
    public getDebugToken(req: IncomingMessage, res: ServerResponse) {
        const token = JWT.generateToken({
            email: "email@email.com",
            id: "1",
            roles: ["user"],
        });

        res.statusCode = 200;
        res.write(token);
        res.end();
    }

    @Route("GET", "/get-admin-token/")
    public getAdminToken(req: IncomingMessage, res: ServerResponse) {
        const token = JWT.generateToken({
            email: "admin@email.com",
            id: "2",
            roles: ["admin, user"],
        });

        res.statusCode = 200;
        res.write(token);
        res.end();
    }

    @Route("GET", "/reset-database/")
    public async resetDatabase(req: IncomingMessage, res: ServerResponse) {
        await IngredientInRecipe.truncate();
        await Recipe.truncate();
        await Ingredient.truncate();
        await User.truncate();

        const newAdmin = User.fromDTO({
            email: "admin@user.com",
            createdAt: new Date(),
            ingredients: [],
            recipes: [],
        });
        await newAdmin.save();

        const newUser = User.fromDTO({
            email: "user@user.com",
            createdAt: new Date(),
            ingredients: [],
            recipes: [],
        });
        await newUser.save();

        const lettuce = Ingredient.fromDTO({
            name: "lettuce",
            owner: newUser,
            recipes: [],
        });

        const tomato = Ingredient.fromDTO({
            name: "tomato",
            owner: newUser,
            recipes: [],
        });

        const salt = Ingredient.fromDTO({
            name: "salt",
            owner: newUser,
            recipes: [],
        });

        const bread = Ingredient.fromDTO({
            name: "bread",
            owner: newUser,
            recipes: [],
        });

        const butter = Ingredient.fromDTO({
            name: "butter",
            owner: newUser,
            recipes: [],
        });

        const salad = Recipe.fromDTO({
            name: "salad",
            owner: newUser,
            ingredients: [],
        });

        const sandwich = Recipe.fromDTO({
            name: "sandwich",
            owner: newUser,
            ingredients: [],
        });

        const tomatoInSalad = IngredientInRecipe.fromDTO({
            ingredient: tomato,
            recipe: salad,
            amount: 1,
            unit: Unit.whole,
        });

        const lettuceInSalad = IngredientInRecipe.fromDTO({
            ingredient: lettuce,
            recipe: salad,
            amount: 12,
            unit: Unit.leaf,
        });

        const saltInSalad = IngredientInRecipe.fromDTO({
            ingredient: salt,
            recipe: salad,
            amount: 1,
            unit: Unit.pinch,
        });

        const breadInSandwich = IngredientInRecipe.fromDTO({
            ingredient: bread,
            recipe: sandwich,
            amount: 2,
            unit: Unit.slice,
        });

        const letuceInSandwich = IngredientInRecipe.fromDTO({
            ingredient: lettuce,
            recipe: sandwich,
            amount: 1,
            unit: Unit.leaf,
        });

        const tomatoInSandwich = IngredientInRecipe.fromDTO({
            ingredient: tomato,
            recipe: sandwich,
            amount: 2,
            unit: Unit.slice,
        });

        const butterInSandwich = IngredientInRecipe.fromDTO({
            ingredient: butter,
            recipe: sandwich,
            amount: 2,
            unit: Unit.slice,
        });

        const saltInSandwich = IngredientInRecipe.fromDTO({
            ingredient: salt,
            recipe: sandwich,
            amount: 1,
            unit: Unit.pinch,
        });

        lettuce.recipes = [lettuceInSalad, letuceInSandwich];
        tomato.recipes = [tomatoInSalad, tomatoInSandwich];
        salt.recipes = [saltInSalad, saltInSandwich];
        butter.recipes = [butterInSandwich];
        bread.recipes = [breadInSandwich];

        salad.ingredients = [lettuceInSalad, tomatoInSalad, saltInSalad];
        sandwich.ingredients = [breadInSandwich, letuceInSandwich, tomatoInSandwich, butterInSandwich, saltInSandwich];

        await salad.save();
        await sandwich.save();

        res.statusCode = 200;
        res.write("Database reset");
        res.end();
    }
}
