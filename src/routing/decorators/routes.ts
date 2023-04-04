import { RouteData, SecurityDefinition } from "../route-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

const RouteList = Symbol("RouteList");

export const Route = (method: string, path: string, security?: SecurityDefinition) => {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        target[RouteList] = target[RouteList] || [];
        target[RouteList].push({
            method,
            path: path.split("/").filter(Boolean),
            handler: descriptor.value,
            security,
        });
    };
};

export interface RouteController {
    routes: RouteData[];
}

export const Routes = <T extends Constructor<object>>(Base: T):T & Constructor<RouteController> => {

    return class extends Base {
        // noinspection JSMismatchedCollectionQueryUpdate
        public routes: RouteData[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            this.routes = Base.prototype[RouteList] || [];
        }
    };
};