import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Ingredient } from "./ingredient";
import { Recipe } from "./recipe";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
        id: number;

    @Column({ unique: true })
        email: string;

    @CreateDateColumn()
        createdAt: Date;

    @OneToMany(() => Ingredient, ingredient => ingredient.owner)
        ingredients: Ingredient[];

    @OneToMany(() => Recipe, recipe => recipe.owner)
        recipes: Recipe[];
}
