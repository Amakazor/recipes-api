import { IncomingMessage, ServerResponse } from "http";

import { TokenPayload } from "./security/jwt";

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
