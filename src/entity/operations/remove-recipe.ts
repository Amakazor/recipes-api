import { Operation } from "../plan-operation";

export type RemoveRecipeDTO = {
    type: "RemoveRecipe"
    inPlanId: number;
}

export function isRemoveRecipe(operation: Operation): operation is RemoveRecipe {
    return operation instanceof RemoveRecipe;
}

export class RemoveRecipe {
    public inPlanId: number;

    private constructor(inPlanId: number) {
        this.inPlanId = inPlanId;
    }

    public static fromDTO(dto: RemoveRecipeDTO) {
        return new RemoveRecipe(dto.inPlanId);
    }

    public toDto(): RemoveRecipeDTO {
        return {
            type: "RemoveRecipe",
            inPlanId: this.inPlanId,
        };
    }
}
