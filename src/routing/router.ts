import { IncomingMessage, ServerResponse } from "http";

import { Controller } from "./controller";
import { isSecureRoute } from "./route-data";
import { handleSecureRoute } from "./security/handle-secure-route";

export class Router {
    private controllers: Controller[] = [];

    constructor(controllers: Controller[]) {
        this.controllers = [...controllers];
    }

    public addController(controller: Controller) {
        this.controllers.push(controller);
    }

    public handleRoute(req: IncomingMessage, res: ServerResponse) {
        const path = req.url?.split("/").filter(Boolean) || [];
        const method = req.method || "GET";
        const routeData = this.controllers.find(controller => controller.matchRoute(path, method))?.matchRoute(path, method);

        if (routeData === undefined) {
            res.statusCode = 404;
            res.end();
            return;
        }

        if (isSecureRoute(routeData)) handleSecureRoute(req, res, routeData);
        else routeData.handler(req, res);
    }
}
