import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Unit } from "../utility/unit";
import { Ingredient, Recipe } from "./";

export interface IngredientInRecipeDTO {
    id?: number;
    amount: number;
    unit: Unit;
    ingredient: Ingredient;
    recipe: Recipe;
}

@Entity()
export class IngredientInRecipe extends BaseEntity implements IngredientInRecipeDTO {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        amount: number;

    @Column({
        default: Unit.piece,
        type: "enum",
        enum: Unit,
    })
        unit: Unit;

    @ManyToOne(() => Ingredient, ingredient => ingredient.recipes, { cascade: true })
        ingredient: Ingredient;

    @ManyToOne(() => Recipe, recipe => recipe.ingredients)
        recipe: Recipe;

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public toDTO(): IngredientInRecipeDTO {
        return {
            id: this.id,
            amount: this.amount,
            unit: this.unit,
            ingredient: this.ingredient,
            recipe: this.recipe,
        };
    }

    public static fromDTO(dto: IngredientInRecipeDTO): IngredientInRecipe {
        const ingredientInRecipe = new IngredientInRecipe();

        ingredientInRecipe.id = dto.id;
        ingredientInRecipe.amount = dto.amount;
        ingredientInRecipe.unit = dto.unit;
        ingredientInRecipe.ingredient = dto.ingredient;
        ingredientInRecipe.recipe = dto.recipe;

        return ingredientInRecipe;
    }

}
