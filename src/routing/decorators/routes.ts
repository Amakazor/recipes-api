import { RouteData, SecurityDefinition } from "../router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

const RouteList = Symbol("RouteList");

type RouteOptions<B, Q> = {
    security?: SecurityDefinition;
    bodyParser?: RouteData<B, Q>["bodyParser"];
    queryParser?: RouteData<B, Q>["queryParser"];
}

export const Route = <B, Q>(method: string, path: string, options?: RouteOptions<B, Q>) => {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        target[RouteList] = target[RouteList] || [];
        target[RouteList].push({
            method,
            path: path.split("/").filter(Boolean),
            handler: descriptor.value,
            security: options?.security,
            bodyParser: options?.bodyParser,
            queryParser: options?.queryParser,
        });
    };
};

export interface RouteController {
    routes: RouteData<never, never>[];
}

export const Routes = <T extends Constructor<object>>(Base: T):T & Constructor<RouteController> => {

    return class extends Base {
        // noinspection JSMismatchedCollectionQueryUpdate
        public routes: RouteData<never, never>[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            this.routes = Base.prototype[RouteList] || [];
        }
    };
};
