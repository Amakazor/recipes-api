import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { IngredientInRecipe } from "./ingredient-in-recipe";
import { User } from "./user";

@Entity()
export class Recipe extends BaseEntity {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        name: string;

    @ManyToOne(() => User, user => user.recipes)
        owner: User;

    @OneToMany(() => IngredientInRecipe, ingredientInRecipe => ingredientInRecipe.recipe)
        ingredients: IngredientInRecipe[];
}
