import { RouteController, Routes } from "./decorators/routes";
import { RouteData, Router } from "./router";

@Routes
export class Controller {
    protected path: string[];
    protected subControllers: Controller[];

    constructor(basePath: string) {
        this.path = basePath.split("/").filter(Boolean);
        this.subControllers = [];
    }

    public matchRoute<B = never, Q = never, P = never>(path: string[], method: string): RouteData<B, Q, P> | undefined {
        if (!this.isOnPath(path)) return undefined;
        const subPath = this.shortenPath(path);

        const routeFromSubControllers = this.subControllers.find(controller => controller.matchRoute<B, Q, P>(subPath, method))?.matchRoute<B, Q, P>(subPath, method);
        if (routeFromSubControllers) return routeFromSubControllers;

        return this.matchOwnRoute(subPath, method);
    }

    private isOnPath(path: string[]): boolean {
        return path.length >= this.path.length && this.path.reduce((acc, part, index) => acc && part === path[index], true);
    }

    private shortenPath(path: string[]): string[] {
        return path.slice(this.path.length);
    }

    private matchOwnRoute<B, Q, P>(path: string[], method: string): RouteData<B, Q, P> | undefined {
        if (!this.hasRoutes()) return;

        const constantRoute = Controller.matchGivenRoutes(path, method, this.constantRoutes, (part, index) => Controller.pathPartMatches(part, path, index, true));
        if (constantRoute) return constantRoute;

        return Controller.matchGivenRoutes(path, method, this.parametrizedRoutes, (part, index) => Controller.pathPartMatches(part, path, index, false));
    }

    private static matchGivenRoutes(path: string[], method: string, routes: RouteData[], partMatcher: (part, index) => boolean) {
        const filteredRoutes = routes.filter(route => Controller.routeSignatureMatches(route, method, path));
        if (filteredRoutes.length === 0) return;

        return filteredRoutes.find(route => route.path.every((part, index) => partMatcher(part, index)));
    }

    private static routeSignatureMatches = (route: RouteData, method: string, path: string[]) => route.method === method && route.path.length === path.length;

    private static pathPartMatches = (part, path: string[], index, strictly) => part === path[index] || (!strictly && Router.isPathPartAParameter(part));

    private hasRoutes = (): this is Controller & RouteController => (this as unknown as RouteController).constantRoutes !== undefined;
}
