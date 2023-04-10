import { ServerResponse } from "http";

import { Request } from "../../../../communication/request";
import { Controller } from "../../../controller";
import { Route, Routes } from "../../../decorators/routes";

@Routes
export class GlobalIngredientController extends Controller {
    constructor() {
        super("/global");
    }

    @Route("POST", "/", { security: { roles: ["admin"] } })
    public addGlobalIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }

    @Route("DELETE", "/", { security: { roles: ["admin"] } })
    public removeGlobalIngredient(req: Request, res: ServerResponse) {
        res.statusCode = 204;
        res.end();
    }
}
