import { ServerResponse } from "http";

import { Request } from "../../../communication/request";
import { Ingredient, IngredientInRecipe, Plan, PlanOperation, Recipe, User } from "../../../entity";
import { AddRecipe } from "../../../entity/operations";
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
    public async getDebugToken(req: Request, res: ServerResponse) {
        const user = await User.firstUser();

        if (!user) {
            res.statusCode = 500;
            res.write("No user found");
            res.end();
            return;
        }

        const token = JWT.generateToken({
            email: user.email,
            id: String(user.id),
            roles: user.roles,
        });

        res.write(token);
        res.statusCode = 404;
        res.end();
    }

    @Route("GET", "/get-admin-token/")
    public async getAdminToken(req: Request, res: ServerResponse) {
        const user = await User.firstAdmin();

        if (!user) {
            res.statusCode = 500;
            res.write("No user found");
            res.end();
            return;
        }

        const token = JWT.generateToken({
            email: user.email,
            id: String(user.id),
            roles: user.roles,
        });

        res.statusCode = 200;
        res.write(token);
        res.end();
    }

    @Route("GET", "/reset-database/")
    public async resetDatabase(req: Request, res: ServerResponse) {
        await DebugController.truncate();

        const newUser = await DebugController.addUsers();

        const recipes = await DebugController.addIngredientsAndRecipes(newUser);

        await DebugController.addPlan(recipes, newUser);

        res.statusCode = 200;
        res.write("Database reset");
        res.end();
    }

    private static truncate = async () => {
        await PlanOperation.truncate();
        await Plan.truncate();
        await IngredientInRecipe.truncate();
        await Recipe.truncate();
        await Ingredient.truncate();
        await User.truncate();
    };

    private static addUsers = async () => {
        const newAdmin = User.fromDTO({
            email: "admin@user.com",
            createdAt: new Date(),
            ingredients: [],
            recipes: [],
            roles: ["admin", "user"],
        });
        await newAdmin.save();

        const newUser = User.fromDTO({
            email: "user@user.com",
            createdAt: new Date(),
            ingredients: [],
            recipes: [],
            roles: ["user"],
        });
        await newUser.save();
        await newUser.reload();
        return newUser;
    };

    private static addIngredientsAndRecipes = async (newUser: User) => {
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

        return {
            salad,
            sandwich,
        };
    };

    private static addPlan = async ({ sandwich, salad }:{sandwich:Recipe, salad:Recipe}, user: User) => {
        const plan:Plan = Plan.fromDTO({
            owner: user,
            operations: [],
        });

        const sandwichOperation: PlanOperation = PlanOperation.fromDTO({
            dataDTO: AddRecipe.fromDTO({
                type: "AddRecipe",
                inPlanId: 1,
                recipeId: sandwich.id,
                date: new Date(Date.now()).toISOString(),
            }).toDto(),
            plan: plan,
            owner: user,
        });

        const saladOperation: PlanOperation = PlanOperation.fromDTO({
            dataDTO: AddRecipe.fromDTO({
                type: "AddRecipe",
                inPlanId: 2,
                recipeId: salad.id,
                date: new Date(Date.now()).toISOString(),
            }).toDto(),
            plan: plan,
            owner: user,
        });

        const sandwichRemovalOperation: PlanOperation = PlanOperation.fromDTO({
            dataDTO: {
                type: "RemoveRecipe",
                inPlanId: 1,
            },
            plan: plan,
            owner: user,
        });

        plan.operations = [sandwichOperation, saladOperation, sandwichRemovalOperation];
        await plan.save();
    };
}
