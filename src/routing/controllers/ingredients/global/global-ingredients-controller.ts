import { ServerResponse } from "http";

import { Request } from "../../../../communication/request";
import { Controller } from "../../../controller";
import { Route, Routes } from "../../../decorators/routes";

@Routes
export class GlobalIngredientController extends Controller {
    constructor() {
        super("/global");
    }

    @Route("POST", "/")
    public addGlobalIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }

    @Route("DELETE", "/")
    public removeGlobalIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }
}
