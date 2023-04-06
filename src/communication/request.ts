// eslint-disable-next-line max-classes-per-file
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import parseUrl from "parseurl";

import { RouteData } from "../routing/router";

export class Request {
    public url: string;
    public method: string;
    public headers: IncomingHttpHeaders;
    public body: unknown;
    public query: unknown;

    // eslint-disable-next-line max-params
    constructor(url, method, headers, body, query) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.body = body;
        this.query = query;
    }

    public static handleIncomingMessage(req: IncomingMessage, res: ServerResponse, handler: (request: Request, response: ServerResponse) => Promise<ServerResponse>) {
        const body = [];

        req.on("data", (chunk) => {
            body.push(chunk);
        });

        req.on("end", async () => {
            const parsedBody = Buffer.concat(body).toString();

            const { query, pathname } = parseUrl(req);
            const parsedQuery = this.parseQuery(query);

            const request = new Request(pathname, req.method, req.headers, parsedBody, parsedQuery);

            (await handler(request, res)).end();
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

export class TypedRequest<B, Q> extends Request {
    public parsedBody: B;
    public parsedQuery: Q;

    constructor(request: Request, bodyParser: RouteData<B, Q>["bodyParser"], queryParser: RouteData<B, Q>["queryParser"]) {
        super(request.url, request.method, request.headers, request.body, request.query);

        this.parsedBody = this.parseBody(bodyParser?.parse ?? TypedRequest.nullparser);
        this.parsedQuery = this.parseQuery(queryParser?.parse ?? TypedRequest.nullparser);
    }

    private parseBody<T>(parser: (body: unknown) => T): T {
        return parser(this.body);
    }

    private parseQuery<T>(parser: (query: unknown) => T): T {
        return parser(this.query);
    }

    private static nullparser = () => null;
}
