/* eslint-disable no-console */
// noinspection TypeScriptValidateJSTypes

import "reflect-metadata";

import { IncomingMessage, ServerResponse } from "http";

import { Request } from "./communication/request";
import { RecipesSource } from "./data-source";
import { DebugController, IngredientController } from "./routing/controllers";
import { Router } from "./routing/router";

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

// noinspection JSUnusedGlobalSymbols
export const viteNodeApp = async (req: IncomingMessage, res: ServerResponse) => {
    Request.handleIncomingMessage(req, res, router.handleRoute);
};
