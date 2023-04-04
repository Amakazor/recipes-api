import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { IngredientInRecipe } from "./ingredient-in-recipe";
import { User } from "./user";

export interface RecipeDTO {
    id?: number;
    name: string;
    owner: User;
    ingredients: IngredientInRecipe[];
}

@Entity()
export class Recipe extends BaseEntity implements RecipeDTO {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        name: string;

    @ManyToOne(() => User, user => user.recipes)
        owner: User;

    @OneToMany(() => IngredientInRecipe, ingredientInRecipe => ingredientInRecipe.recipe, { cascade: true })
        ingredients: IngredientInRecipe[];

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public toDTO(): RecipeDTO {
        return {
            id: this.id,
            name: this.name,
            owner: this.owner,
            ingredients: this.ingredients,
        };
    }

    public static fromDTO(dto: RecipeDTO): Recipe {
        const recipe = new Recipe();

        recipe.id = dto.id;
        recipe.name = dto.name;
        recipe.owner = dto.owner;
        recipe.ingredients = dto.ingredients;

        return recipe;
    }
}
