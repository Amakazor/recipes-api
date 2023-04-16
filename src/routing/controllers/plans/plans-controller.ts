import { ServerResponse } from "http";
import { z } from "zod";

import { TypedRequest } from "../../../communication/request";
import { Plan, User } from "../../../entity";
import { Controller } from "../../controller";
import { Route, Routes } from "../../decorators/routes";

@Routes
export class PlansController extends Controller {
    constructor() {
        super("/plans");
    }

    @Route("GET", "/", { security: { roles: ["user"] } })
    public async getAllPlansFromUser(req: TypedRequest, res: ServerResponse, user: User) {
        const plans = await Plan.getByIdFromUser(user);

        if (!plans) {
            res.statusCode = 404;
            res.end();
            return;
        }

        res.write(JSON.stringify(await Promise.all(plans.map(async plan => await plan.toTransferable()))));
        res.statusCode = 200;
        res.end();
    }

    private static getByIdFromUserParameters = { pathParametersParser: z.object({ id: z.coerce.number() }) };
    @Route("GET", "/[id]", {
        security: { roles: ["user"] },
        ...PlansController.getByIdFromUserParameters,
    })
    public async getByIdFromUser(req: TypedRequest<never, never, z.infer<typeof PlansController.getByIdFromUserParameters.pathParametersParser>>, res: ServerResponse, user: User) {
        const plan = await Plan.getOneByIdFromUser(req.parsedPathParameters.id, user);

        if (!plan) {
            res.statusCode = 404;
            return res.end();
        }

        res.write(JSON.stringify(await plan.toTransferable()));
        res.statusCode = 200;
        res.end();
    }
}
