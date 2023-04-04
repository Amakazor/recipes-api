import { IncomingMessage, ServerResponse } from "http";

import { Controller } from "../../../controller";
import { Route, Routes } from "../../../decorators/routes";

@Routes
export class GlobalIngredientController extends Controller {
    constructor() {
        super("/global");
    }

    @Route("POST", "/")
    public addGlobalIngredient(req: IncomingMessage, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }

    @Route("DELETE", "/")
    public removeGlobalIngredient(req: IncomingMessage, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }
}
