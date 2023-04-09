import { Operation } from "../plan-operation";

export type AddRecipeDTO = {
    type: "AddRecipe"
    recipeId: number;
    inPlanId: number;
    date: string;
}

export function isAddRecipe(operation: Operation): operation is AddRecipe {
    return operation instanceof AddRecipe;
}

export class AddRecipe {
    public recipeId: number;
    public inPlanId: number;
    public date: Date;

    private constructor(recipeId: number, date: Date, inPlanId: number) {
        this.recipeId = recipeId;
        this.date = date;
        this.inPlanId = inPlanId;
    }

    public static fromDTO(dto: AddRecipeDTO) {
        return new AddRecipe(dto.recipeId, new Date(dto.date), dto.inPlanId);
    }

    public toDto(): AddRecipeDTO {
        return {
            type: "AddRecipe",
            recipeId: this.recipeId,
            date: this.date.toISOString(),
            inPlanId: this.inPlanId,
        };
    }
}
