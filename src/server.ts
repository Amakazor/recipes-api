/* eslint-disable no-console */

import "reflect-metadata";

import { IncomingMessage, ServerResponse } from "http";

import { Request } from "./communication/request";
import { RecipesSource } from "./data-source";
import { DebugController, IngredientController } from "./routing/controllers";
import { Router } from "./routing/router";

declare global {
    interface Array<T> {
        firstMapped<U>(callbackfn: (value: T, index: number, array: T[]) => U, predicate: (val: U, i: number, obj: T[]) => boolean): U | undefined;
        firstNotEmptyMapped<U>(callbackfn: (value: T, index: number, array: T[]) => U): U | undefined;
        mapAndFilterOutEmpty<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
    }
}

Array.prototype.firstMapped = function <T, U>(this: T[], callbackfn: (value: T, index: number, array: T[]) => U, predicate: (val: U, i: number, obj: T[]) => boolean): U | undefined {
    for (let i = 0; i < this.length; i++) {
        const element = this[i];
        const mapped = callbackfn(element, i, this);
        if (predicate(mapped, i, this)) return mapped;
    }
    return undefined;
};

Array.prototype.firstNotEmptyMapped = function <T, U>(this: T[], callbackfn: (value: T, index: number, array: T[]) => U): U | undefined {
    return this.firstMapped(callbackfn, el => Boolean(el));

};

Array.prototype.mapAndFilterOutEmpty = function <T, U>(this: T[], callbackfn: (value: T, index: number, array: T[]) => U): NonNullable<U>[] {
    return this.map(callbackfn).filter(Boolean);
};

try {
    await RecipesSource.initialize();
    console.log("Database connection established");
} catch (error) {
    console.error("Database connection failed");
    console.error(error);
}

const router = new Router([
    new IngredientController(),
    new DebugController(),
]);

export const viteNodeApp = async (req: IncomingMessage, res: ServerResponse) => {
    Request.handleIncomingMessage(req, res, router.handleRoute);
};
