import { createHmac } from "crypto";
import { IncomingMessage } from "http";

const SECRET = import.meta.env.VITE_JWT_SECRET;

export type TokenParts = {
    header: string;
    payload: string;
    signature: string;
}

export type TokenPayload = {
    id: string;
    email: string;
    roles: string[];
}

const extractBearerToken = (request: IncomingMessage):string | undefined => {
    const { authorization } = request.headers;
    if (authorization) {
        const [type, token] = authorization.split(" ");
        if (type === "Bearer") return token;
    }
    return undefined;
};

const splitToken = (token: string) => {
    const [header, payload, signature] = token.split(".");
    return {
        header,
        payload,
        signature,
    };
};

const verifyToken = (tokenParts: TokenParts) => {
    const { header, payload, signature } = tokenParts;

    const challenge = `${header}.${payload}`;
    const hash = createHmac("sha256", SECRET).update(challenge).digest("base64");

    return hash === signature;
};

const extractTokenPayload = (token: string):TokenPayload | undefined => {
    const parts = splitToken(token);
    if (!verifyToken(parts)) return undefined;

    const payload = Buffer.from(parts.payload, "base64").toString();
    return JSON.parse(payload);
};

export const getTokenPayload = (request: IncomingMessage) => {
    const token = extractBearerToken(request);
    if (token) return extractTokenPayload(token);

};

export const generateToken = (payload: TokenPayload) => {
    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const headerString = Buffer.from(JSON.stringify(header)).toString("base64");
    const payloadString = Buffer.from(JSON.stringify(payload)).toString("base64");

    const signature = createHmac("sha256", SECRET).update(`${headerString}.${payloadString}`).digest("base64");

    return `${headerString}.${payloadString}.${signature}`;
};
