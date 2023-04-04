import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Unit } from "../utility/unit";
import { Ingredient } from "./ingredient";
import { Recipe } from "./recipe";

@Entity()
export class IngredientInRecipe extends BaseEntity {
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

    @ManyToOne(() => Ingredient, ingredient => ingredient.recipes)
        ingredient: Ingredient;

    @ManyToOne(() => Recipe, recipe => recipe.ingredients)
        recipe: Recipe;
}
