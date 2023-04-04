import { IncomingMessage, ServerResponse } from "http";

import { Controller } from "./controller";
import { JWT, TokenPayload } from "./security/jwt";

export type SecureHandler = (request: IncomingMessage, response: ServerResponse, token: TokenPayload) => void;
export type UnsecureHandler = (request: IncomingMessage, response: ServerResponse) => void;

export type SecurityDefinition = {
    roles: string[];
}

export type SecureRoute = {
    method: string;
    path: string[];
    handler: SecureHandler;
    security: SecurityDefinition;
}

export type UnsecureRoute = {
    method: string;
    path: string[];
    handler: UnsecureHandler;
}

export type RouteData = SecureRoute | UnsecureRoute;
export const isSecureRoute = (route: RouteData): route is SecureRoute => (route as SecureRoute).security !== undefined;

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

        if (isSecureRoute(routeData)) this.handleSecureRoute(req, res, routeData);
        else routeData.handler(req, res);
    }

    private sendUnauthorized = (response: ServerResponse) => {
        response.statusCode = 401;
        response.end();
    };

    private handleSecureRoute = (request: IncomingMessage, response: ServerResponse, { handler, security }: SecureRoute) => {
        const tokenPayload = JWT.getTokenPayload(request);
        if (!tokenPayload) return this.sendUnauthorized(response);

        if (security.roles.some(role => !tokenPayload.roles.includes(role))) return this.sendUnauthorized(response);

        handler(request, response, tokenPayload);
    };

}
