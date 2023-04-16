import { ServerResponse } from "http";
import { SafeParseReturnType } from "zod";

import { Request, TypedRequest } from "../communication/request";
import { User } from "../entity";
import { Controller } from "./controller";
import { JWT, TokenPayload } from "./security/jwt";

export type SecureHandler<B, Q, P> = (request: TypedRequest<B, Q, P>, response: ServerResponse, user: User) => Promise<void>;
export type UnsecureHandler<B, Q, P> = (request: TypedRequest<B, Q, P>, response: ServerResponse) => Promise<void>;

export type SecurityDefinition = {
    roles: string[];
}

export type UnsecureRoute<B = never, Q = never, P = never> = {
    method: string;
    path: string[];
    handler: UnsecureHandler<B, Q, P>;
    bodyParser?: { safeParse: (data: unknown) => SafeParseReturnType<unknown, B> }
    queryParser?: { safeParse: (data: unknown) => SafeParseReturnType<unknown, Q> };
    pathParametersParser?: { safeParse: (data: unknown) => SafeParseReturnType<unknown, P> };
}

export type SecureRoute<B = never, Q = never, P = never> = UnsecureRoute<B, Q, P> & {
    security: SecurityDefinition;
    handler: SecureHandler<B, Q, P>;
}

export type RouteData<B = never, Q = never, P = never> = SecureRoute<B, Q, P> | UnsecureRoute<B, Q, P>;
export const isSecureRoute = <B = never, Q = never, P = never>(route: RouteData<B, Q, P>): route is SecureRoute<B, Q, P> => (route as SecureRoute<B, Q, P>).security !== undefined;

export class Router {
    private controllers: Controller[] = [];

    constructor(controllers: Controller[]) {
        this.controllers = [...controllers];
    }

    public addController(controller: Controller) {
        this.controllers.push(controller);
    }

    public handleRoute = async (req: Request, res: ServerResponse): Promise<void> => {
        const path = req.url?.split("/").filter(Boolean) || [];
        const method = req.method || "GET";
        const routeData = this.matchRoute(path, method);

        if (!routeData) {
            res.statusCode = 404;
            res.end();
            return;
        }

        let typedRequest: TypedRequest;

        try {
            typedRequest = new TypedRequest(req, routeData, this.extractParameters(path.slice(-routeData.path.length), routeData));
        } catch (error) {
            res.statusCode = 400;
            res.write(error.message);
            res.end();
            return;
        }

        if (isSecureRoute(routeData)) await Router.handleSecureRoute(typedRequest, res, routeData);
        else await Router.handleUnsecureRoute(typedRequest, res, routeData);
    };

    private matchRoute(path: string[], method: string) {
        return this.controllers.firstNotEmptyMapped(controller => controller.matchRoute(path, method));
    }

    private extractParameters(path: string[], route: RouteData): Record<string, string> {
        return route.path
            .map((part, index) => [index, part] as const)
            .filter(([, part]) => Router.isPathPartAParameter(part))
            .reduce<Record<string, string>>((acc, [index, part]) => ({
                ...acc,
                [part.slice(1, -1)]: path[index],
            }), {});
    }

    private static getUserFromToken = async (payload: TokenPayload): Promise<User | undefined> => {
        try {
            return User.findOneBy({ id: parseInt(payload.id, 10) });
        } catch {
            return undefined;
        }
    };

    private static handleUnsecureRoute = async <B, Q, P>(request: TypedRequest<B, Q, P>, response: ServerResponse, { handler }: UnsecureRoute<B, Q, P>) => {
        await handler(request, response);
    };

    public static isPathPartAParameter = (part: string) => part.length > 2 && part.startsWith("[") && part.endsWith("]");
    public static isParametrizedRoute = (route: RouteData) => route.path.some(Router.isPathPartAParameter);
    public static isNotParametrizedRoute = (route: RouteData) => !Router.isParametrizedRoute(route);

    private static handleSecureRoute = async <B, Q, P>(request: TypedRequest<B, Q, P>, response: ServerResponse, {
        handler,
        security,
    }: SecureRoute<B, Q, P>) => {
        const tokenPayload = JWT.getTokenPayload(request);
        if (!tokenPayload) return Router.sendUnauthorized(response);

        if (security.roles.some(role => !tokenPayload.roles.includes(role))) return Router.sendUnauthorized(response);

        const user = await Router.getUserFromToken(tokenPayload);
        if (user === undefined) return Router.sendUnauthorized(response);

        await handler(request, response, user);
    };

    private static sendUnauthorized = (response: ServerResponse) => {
        response.statusCode = 401;
        response.end();
    };

}
