/* eslint-disable max-params */
// eslint-disable-next-line max-classes-per-file
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import parseUrl from "parseurl";
import { SafeParseReturnType } from "zod";

import { RouteData } from "../routing/router";

export class Request {
    public url: string;
    public method: string;
    public headers: IncomingHttpHeaders;
    public body: unknown;
    public query: unknown;

    constructor(url, method, headers, body, query) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.body = body;
        this.query = query;
    }

    public static handleIncomingMessage(req: IncomingMessage, res: ServerResponse, handler: (request: Request, response: ServerResponse) => Promise<void>) {
        const body = [];

        req.on("data", (chunk) => {
            body.push(chunk);
        });

        req.on("end", async () => {
            const parsedBody = Buffer.concat(body).toString();

            const { query, pathname } = parseUrl(req);
            const parsedQuery = this.parseQuery(query);

            const request = new Request(pathname, req.method, req.headers, parsedBody, parsedQuery);

            await handler(request, res);
            res.end();
        });
    }

    private static parseQuery(query) {
        return typeof query === "object" ? query : query.split("&").reduce((acc, cur) => {
            const [key, value] = cur.split("=");
            acc[key] = value ?? true;
            return acc;
        }, {});
    }
}

export class TypedRequest<B = never, Q = never, P = never> extends Request {
    private readonly pathParameters: Record<string, string>;

    public parsedBody: B;
    public parsedQuery: Q;
    public parsedPathParameters: P;

    constructor(request: Request, routeData: RouteData, pathParameters: Record<string, string>) {
        super(request.url, request.method, request.headers, request.body, request.query);
        this.pathParameters = pathParameters;

        try {
            this.parsedBody = this.parseBody(routeData.bodyParser?.safeParse ?? TypedRequest.nullparser);
        } catch (error) {
            throw new Error(`Invalid request body: ${error}`);
        }

        try {
            this.parsedQuery = this.parseQuery(routeData.queryParser?.safeParse ?? TypedRequest.nullparser);
        } catch (error) {
            throw new Error(`Invalid request query: ${error}`);
        }

        try {
            this.parsedPathParameters = this.parsePathParameters(routeData.pathParametersParser?.safeParse ?? TypedRequest.nullparser);
        } catch (error) {
            throw new Error(`Invalid request path parameters: ${error}`);
        }
    }

    private parseBody<T>(parser: (body: unknown) => SafeParseReturnType<unknown, T>): T {
        const parsed = parser(this.body);
        if (parsed.success === false) throw parsed.error;
        return parsed.data;
    }

    private parseQuery<T>(parser: (query: unknown) => SafeParseReturnType<unknown, T>): T {
        const parsed = parser(this.query);
        if (parsed.success === false) throw parsed.error;
        return parsed.data;
    }

    private parsePathParameters<T>(parser: (query: unknown) => SafeParseReturnType<unknown, T>): T {
        const parsed = parser(this.pathParameters);
        if (parsed.success === false) throw parsed.error;
        return parsed.data;
    }

    private static nullparser = () => ({
        success: true as const,
        data: null,
    });
}
