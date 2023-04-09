import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { IngredientInRecipe, User } from "./";

export interface IngredientDTO {
    id?: number;
    name: string;
    owner: User;
    recipes: IngredientInRecipe[];
}

@Entity()
export class Ingredient extends BaseEntity implements IngredientDTO {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        name: string;

    @ManyToOne(() => User, user => user.ingredients)
        owner: User;
    @OneToMany(() => IngredientInRecipe, ingredientInRecipe => ingredientInRecipe.ingredient)
        recipes: IngredientInRecipe[];

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public toDTO(): IngredientDTO {
        return {
            id: this.id,
            name: this.name,
            owner: this.owner,
            recipes: this.recipes,
        };
    }

    public static fromDTO(dto: IngredientDTO): Ingredient {
        const ingredient = new Ingredient();

        ingredient.id = dto.id;
        ingredient.name = dto.name;
        ingredient.owner = dto.owner;
        ingredient.recipes = dto.recipes;

        return ingredient;
    }
}
