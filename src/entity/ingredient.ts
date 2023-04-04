import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { IngredientInRecipe } from "./ingredient-in-recipe";
import { User } from "./user";

@Entity()
export class Ingredient extends BaseEntity {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        name: string;

    @ManyToOne(() => User, user => user.ingredients)
        owner: User;
    @OneToMany(() => IngredientInRecipe, ingredientInRecipe => ingredientInRecipe.ingredient)
        recipes: IngredientInRecipe[];
}
