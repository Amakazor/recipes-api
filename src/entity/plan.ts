import { BaseEntity, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Unit } from "../utility/unit";
import { Operation, PlanOperation, Recipe, User } from "./";
import { AddRecipe, isAddRecipe, isRemoveRecipe } from "./operations";

export interface PlanDTO {
    id?: number;
    operations: PlanOperation[];
    owner: User;
}

export type IngredientTransferableDto = {
    id: number;
    name: string;
    unit: Unit;
    amount: number;
}

export type RecipeTransferableDto = {
    id: number;
    inPlanId: number;
    name: string;
    ingredients: IngredientTransferableDto[];
    date: string;
}

export type PlanTransferableDto = {
    id: number;
    owner: number;
    recipes: RecipeTransferableDto[];
}

@Entity()
export class Plan extends BaseEntity implements PlanDTO {
    @PrimaryGeneratedColumn()
        id: number;

    @OneToMany(() => PlanOperation, operation => operation.plan, { cascade: true })
        operations: PlanOperation[];

    @ManyToOne(() => User, user => user.ingredients)
        owner: User;

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public static fromDTO(dto: PlanDTO) {
        const plan = new Plan();
        plan.id = dto.id;
        plan.operations = dto.operations;
        plan.owner = dto.owner;

        return plan;
    }

    private getOperationDataOfType<T extends Operation>(guard: (operation: Operation) => operation is T) {
        return this.operations
            .map(({ data }) => data)
            .filter<T>(guard);
    }

    private static async ingredientsToTransferable(recipe: Recipe):Promise<IngredientTransferableDto[]> {
        return Promise.all(recipe.ingredients.map(recipeIngredient => ({
            id: recipeIngredient.ingredient.id,
            name: recipeIngredient.ingredient.name,
            unit: recipeIngredient.unit,
            amount: recipeIngredient.amount,
        })));
    }

    private static async recipeToTransferable({ recipeId, inPlanId, date }:AddRecipe):Promise<RecipeTransferableDto> {
        const recipe = await Recipe.findOneWithAllData(recipeId);

        const ingredients: IngredientTransferableDto[] = await Plan.ingredientsToTransferable(recipe);

        return {
            id: recipeId,
            inPlanId: inPlanId,
            name: recipe.name,
            date: date.toISOString(),
            ingredients,
        };
    }

    public async toTransferable():Promise<PlanTransferableDto> {
        const addedRecipes: RecipeTransferableDto[] = await Promise.all(this.getOperationDataOfType(isAddRecipe).map(Plan.recipeToTransferable));

        const recipesToRemove = this.getOperationDataOfType(isRemoveRecipe).map(deletion => deletion.inPlanId);

        const filteredRecipes = addedRecipes.filter(addedRecipe => !recipesToRemove.includes(addedRecipe.inPlanId));

        return {
            id: this.id,
            owner: this.owner.id,
            recipes: filteredRecipes,
        };
    }

    public static async getByIdFromUser(owner: User) {
        return await this.getRepository().createQueryBuilder("plan")
            .leftJoinAndSelect("plan.operations", "operation")
            .leftJoinAndSelect("plan.owner", "owner")
            .where("owner.id = :ownerId", { ownerId: owner.id })
            .getMany();
    }

    public static async getOneByIdFromUser(id: number, owner: User) {
        return await this.getRepository().createQueryBuilder("plan")
            .leftJoinAndSelect("plan.operations", "operation")
            .leftJoinAndSelect("plan.owner", "owner")
            .where("plan.id = :id", { id })
            .where("owner.id = :ownerId", { ownerId: owner.id })
            .getOne();
    }
}
