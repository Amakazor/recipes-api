import { ServerResponse } from "http";

import { Request, TypedRequest } from "../communication/request";
import { Controller } from "./controller";
import { JWT, TokenPayload } from "./security/jwt";

export type SecureHandler<B, Q> = (request: TypedRequest<B, Q>, response: ServerResponse, token: TokenPayload) => Promise<void>;
export type UnsecureHandler<B, Q> = (request: TypedRequest<B, Q>, response: ServerResponse) => Promise<void>;

export type SecurityDefinition = {
    roles: string[];
}

export type UnsecureRoute<B, Q> = {
    method: string;
    path: string[];
    handler: UnsecureHandler<B, Q>;
    bodyParser?: {parse: (data: unknown) => B}
    queryParser?: {parse: (data: unknown) => Q};
}

export type SecureRoute<B, Q> = UnsecureRoute<B, Q> & {
    security: SecurityDefinition;
    handler: SecureHandler<B, Q>;
}

export type RouteData<B, Q> = SecureRoute<B, Q> | UnsecureRoute<B, Q> ;
export const isSecureRoute = <B, Q> (route: RouteData<B, Q> ): route is SecureRoute<B, Q> => (route as SecureRoute<B, Q>).security !== undefined;

export class Router {
    private controllers: Controller[] = [];

    constructor(controllers: Controller[]) {
        this.controllers = [...controllers];
    }

    public addController(controller: Controller) {
        this.controllers.push(controller);
    }

    public handleRoute = async (req: Request, res: ServerResponse): Promise<ServerResponse> => {
        const path = req.url?.split("/").filter(Boolean) || [];
        const method = req.method || "GET";
        const routeData = this.controllers.find(controller => controller.matchRoute(path, method))?.matchRoute(path, method);

        if (routeData === undefined) {
            res.statusCode = 404;
            res.end();
            return;
        }

        const typedRequest = new TypedRequest(req, routeData.bodyParser, routeData.queryParser);

        if (isSecureRoute(routeData)) await this.handleSecureRoute(typedRequest, res, routeData);
        else await this.handleUnsecureRoute(typedRequest, res, routeData);

        return res;
    };

    private sendUnauthorized = (response: ServerResponse) => {
        response.statusCode = 401;
        response.end();
    };

    private handleUnsecureRoute = async <B, Q>(request: TypedRequest<B, Q>, response: ServerResponse, { handler }: UnsecureRoute<B, Q>) => {
        await handler(request, response);
    };

    private handleSecureRoute = async <B, Q>(request: TypedRequest<B, Q>, response: ServerResponse, { handler, security }: SecureRoute<B, Q>) => {
        const tokenPayload = JWT.getTokenPayload(request);
        if (!tokenPayload) return this.sendUnauthorized(response);

        if (security.roles.some(role => !tokenPayload.roles.includes(role))) return this.sendUnauthorized(response);

        await handler(request, response, tokenPayload);
    };

}
