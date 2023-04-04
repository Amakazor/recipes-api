import { IncomingMessage, ServerResponse } from "http";

import { SecureRoute } from "../route-data";
import { getTokenPayload } from "./jwt";

const sendUnauthorized = (response: ServerResponse) => {
    response.statusCode = 401;
    response.end();
};
export const handleSecureRoute = (request: IncomingMessage, response: ServerResponse, { handler, security }: SecureRoute) => {
    const tokenPayload = getTokenPayload(request);
    if (!tokenPayload) return sendUnauthorized(response);

    if (security.roles.some(role => !tokenPayload.roles.includes(role))) return sendUnauthorized(response);

    handler(request, response, tokenPayload);
};
