import { ServerResponse } from "http";

import { Request } from "../../../communication/request";
import { Controller } from "../../controller";
import { Route, Routes } from "../../decorators/routes";
import { GlobalIngredientController } from "./global/global-ingredients-controller";

@Routes
export class IngredientController extends Controller {
    constructor() {
        super("/ingredients");
        this.subControllers.push(new GlobalIngredientController());
    }

    @Route("GET", "/")
    public getIngredients(req: Request, res: ServerResponse) {
        res.statusCode = 200;
        res.write(JSON.stringify({ ingredients: [] }));
        res.end();
    }

    @Route("POST", "/")
    public addIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }

    @Route("DELETE", "/")
    public removeIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }
}
