import { createHmac } from "crypto";

import { Request } from "../../communication/request";

const SECRET = import.meta.env.VITE_JWT_SECRET;

type TokenParts = {
    header: string;
    payload: string;
    signature: string;
}

export type TokenPayload = {
    id: string;
    email: string;
    roles: string[];
}

export class JWT {
    private static extractBearerToken = (request: Request):string | undefined => {
        const { authorization } = request.headers;
        if (authorization) {
            const [type, token] = authorization.split(" ");
            if (type === "Bearer") return token;
        }
        return undefined;
    };

    private static splitToken = (token: string) => {
        const [header, payload, signature] = token.split(".");
        return {
            header,
            payload,
            signature,
        };
    };

    private static verifyToken = (tokenParts: TokenParts) => {
        const { header, payload, signature } = tokenParts;

        const challenge = `${header}.${payload}`;
        const hash = createHmac("sha256", SECRET).update(challenge).digest("base64");

        return hash === signature;
    };

    private static extractTokenPayload = (token: string):TokenPayload | undefined => {
        const parts = this.splitToken(token);
        if (!this.verifyToken(parts)) return undefined;

        const payload = Buffer.from(parts.payload, "base64").toString();
        return JSON.parse(payload);
    };

    public static getTokenPayload = (request: Request) => {
        const token = this.extractBearerToken(request);
        if (token) return this.extractTokenPayload(token);

    };

    public static generateToken = (payload: TokenPayload) => {
        const header = {
            alg: "HS256",
            typ: "JWT",
        };

        const headerString = Buffer.from(JSON.stringify(header)).toString("base64");
        const payloadString = Buffer.from(JSON.stringify(payload)).toString("base64");

        const signature = createHmac("sha256", SECRET).update(`${headerString}.${payloadString}`).digest("base64");

        return `${headerString}.${payloadString}.${signature}`;
    };
}
