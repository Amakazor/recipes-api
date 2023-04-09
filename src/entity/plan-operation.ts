import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Plan, User } from "./";
import { AddRecipe, AddRecipeDTO, RemoveRecipe, RemoveRecipeDTO } from "./operations";

export type OperationDTO = AddRecipeDTO | RemoveRecipeDTO;
export type Operation = AddRecipe | RemoveRecipe;

export type PlanOperationDTO = {
    id?: number;
    dataDTO: OperationDTO;
    owner: User;
    plan: Plan;
}

@Entity()
export class PlanOperation extends BaseEntity implements PlanOperationDTO {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({ type: "json" })
        dataDTO: OperationDTO;

    get data(): Operation {
        switch (this.dataDTO.type) {
            case "AddRecipe":
                return AddRecipe.fromDTO(this.dataDTO);
            case "RemoveRecipe":
                return RemoveRecipe.fromDTO(this.dataDTO);
        }
    }

    @ManyToOne(() => User, user => user.ingredients)
        owner: User;

    @ManyToOne(() => Plan, plan => plan.operations)
        plan: Plan;

    private static async resetAutoIncrement() {
        const { tableName } = this.getRepository().metadata;
        await this.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);
    }

    public static async truncate() {
        await this.delete({});
        await this.resetAutoIncrement();
    }

    public static fromDTO(dto: PlanOperationDTO) {
        const planOperation = new PlanOperation();
        planOperation.id = dto.id;
        planOperation.dataDTO = dto.dataDTO;
        planOperation.owner = dto.owner;
        planOperation.plan = dto.plan;

        return planOperation;
    }
}
