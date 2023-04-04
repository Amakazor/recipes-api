import { BaseEntity, Column, CreateDateColumn, Entity, Not, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Ingredient } from "./ingredient";
import { Recipe } from "./recipe";

export type Role = "admin" | "user";

export interface UserDTO {
    id?: number;
    email: string;
    createdAt: Date;
    ingredients: Ingredient[];
    recipes: Recipe[];
    roles: Role[];
}

@Entity()
export class User extends BaseEntity implements UserDTO {

    @PrimaryGeneratedColumn()
        id: number;

    @Column({ unique: true })
        email: string;

    @CreateDateColumn()
        createdAt: Date;

    @Column("simple-array")
        roles: Role[];

    @OneToMany(() => Ingredient, ingredient => ingredient.owner)
        ingredients: Ingredient[];

    @OneToMany(() => Recipe, recipe => recipe.owner)
        recipes: Recipe[];

    public static byId(id: number): Promise<User> {
        return this.findOne({ where: { id } });
    }

    public static firstAdmin(): Promise<User> {
        return this.findOne({ where: { roles: "admin" } });
    }

    public static firstUser(): Promise<User> {
        return this.findOne({ where: { roles: Not("admin") } });
    }

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public toDTO(): UserDTO {
        return {
            id: this.id,
            email: this.email,
            createdAt: this.createdAt,
            ingredients: this.ingredients,
            recipes: this.recipes,
            roles: this.roles,
        };
    }

    public static fromDTO(dto: UserDTO): User {
        const user = new User();

        user.id = dto.id;
        user.email = dto.email;
        user.createdAt = dto.createdAt;
        user.ingredients = dto.ingredients;
        user.recipes = dto.recipes;
        user.roles = dto.roles;

        return user;
    }
}
