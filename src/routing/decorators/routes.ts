import { RouteData, Router, SecurityDefinition } from "../router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

const RouteList = Symbol("RouteList");

type RouteOptions<B, Q, P> = {
    security?: SecurityDefinition;
    bodyParser?: RouteData<B, Q, P>["bodyParser"];
    queryParser?: RouteData<B, Q, P>["queryParser"];
    pathParametersParser?: RouteData<B, Q, P>["pathParametersParser"];
}

export const Route = <B, Q, P>(method: string, path: string, options?: RouteOptions<B, Q, P>) => {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        target[RouteList] = target[RouteList] || [];
        target[RouteList].push({
            method,
            path: path.split("/").filter(Boolean),
            handler: descriptor.value,
            security: options?.security,
            bodyParser: options?.bodyParser,
            queryParser: options?.queryParser,
            pathParametersParser: options?.pathParametersParser,
        });
    };
};

export interface RouteController {
    constantRoutes: RouteData[];
    parametrizedRoutes: RouteData[];
}

export const Routes = <T extends Constructor<object>>(Base: T):T & Constructor<RouteController> => {

    // noinspection JSMismatchedCollectionQueryUpdate
    return class extends Base {
        public constantRoutes: RouteData[];
        public parametrizedRoutes: RouteData[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            const allRoutes:RouteData[] = Base.prototype[RouteList] || [];

            this.parametrizedRoutes = allRoutes.filter(Router.isParametrizedRoute);
            this.constantRoutes = allRoutes.filter(Router.isNotParametrizedRoute);
        }
    };
};
