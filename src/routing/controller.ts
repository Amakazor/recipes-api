import { RouteController, Routes } from "./decorators/routes";
import { RouteData } from "./router";

@Routes
export class Controller {
    protected path: string[];
    protected subControllers: Controller[];

    constructor(basePath: string) {
        this.path = basePath.split("/").filter(Boolean);
        this.subControllers = [];
    }

    public matchRoute<B, Q>(path: string[], method: string): RouteData<B, Q> | undefined {
        if (!this.isOnPath(path)) return undefined;

        const subPath = this.shortenPath(path);

        const routeFromSubControllers = this.subControllers.find(controller => controller.matchRoute<B, Q>(subPath, method))?.matchRoute<B, Q>(subPath, method);
        if (routeFromSubControllers) return routeFromSubControllers;

        return this.matchOwnRoute(subPath, method);
    }

    private isOnPath(path: string[]): boolean {
        return path.length >= this.path.length && this.path.reduce((acc, part, index) => acc && part === path[index], true);
    }

    private shortenPath(path: string[]): string[] {
        return path.slice(this.path.length);
    }

    private matchOwnRoute<B, Q>(path: string[], method: string): RouteData<B, Q> | undefined {
        if (!this.hasRoutes()) return undefined;
        return this.routes.find(route => route.method === method && route.path.length === path.length && route.path.every((part, index) => part === path[index]));
    }

    private hasRoutes = (): this is Controller & RouteController => (this as unknown as RouteController).routes !== undefined;
}
