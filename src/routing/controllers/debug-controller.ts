import { IncomingMessage, ServerResponse } from "http";

import { Controller } from "../controller";
import { Route, Routes } from "../decorators/routes";
import { JWT } from "../security/jwt";

@Routes
export class DebugController extends Controller {
    constructor() {
        super("/debug");
    }

    @Route("GET", "/get-token/")
    public getDebugToken(req: IncomingMessage, res: ServerResponse) {
        const token = JWT.generateToken({
            email: "email@email.com",
            id: "1",
            roles: ["user"],
        });

        res.statusCode = 200;
        res.write(token);
        res.end();
    }

    @Route("GET", "/get-admin-token/")
    public getAdminToken(req: IncomingMessage, res: ServerResponse) {
        const token = JWT.generateToken({
            email: "admin@email.com",
            id: "2",
            roles: ["admin, user"],
        });

        res.statusCode = 200;
        res.write(token);
        res.end();
    }
}
