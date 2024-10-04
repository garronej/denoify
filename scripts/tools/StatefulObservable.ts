export type StatefulObservable<T> = {
    current: T;
    subscribe: (next: (data: T) => void) => Subscription;
};

export type StatefulReadonlyObservable<T> = {
    readonly current: T;
    subscribe: (next: (data: T) => void) => Subscription;
};

export type Subscription = {
    unsubscribe(): void;
};

export function createStatefulObservable<T>(getInitialValue: () => T): StatefulObservable<T> {
    let nextFunctions: ((data: T) => void)[] = [];

    const { get, set } = (() => {
        let wrappedState: [T] | undefined = undefined;

        return {
            get: () => {
                if (wrappedState === undefined) {
                    wrappedState = [getInitialValue()];
                }
                return wrappedState[0];
            },
            set: (data: T) => {
                wrappedState = [data];

                nextFunctions.forEach(next => next(data));
            }
        };
    })();

    return Object.defineProperty(
        {
            current: null as any as T,
            subscribe: (next: (data: T) => void) => {
                nextFunctions.push(next);

                return {
                    unsubscribe: () => nextFunctions.splice(nextFunctions.indexOf(next), 1)
                };
            }
        },
        "current",
        {
            enumerable: true,
            get,
            set
        }
    );
}
