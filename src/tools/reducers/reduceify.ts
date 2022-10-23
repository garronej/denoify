export type ReduceCallbackFunction<ArrOf, ReduceTo> = (
    previousValue: ReduceTo,
    currentValue: ArrOf,
    currentIndex: number,
    array: readonly ArrOf[]
) => ReduceTo;

export type ReduceArguments<ArrOf, ReduceTo> = [ReduceCallbackFunction<ArrOf, ReduceTo>, ReduceTo];

export function toReduceArguments<ArrOf, ReduceTo, Params extends any[]>(
    arrOp: (arr: readonly ArrOf[], ...params: Params) => ReduceTo,
    ...params: Params
): ReduceArguments<ArrOf, ReduceTo> {
    let outWrap: [ReduceTo] | [] = [];

    const reduceCallbackFunction: ReduceCallbackFunction<ArrOf, ReduceTo> = (...[, , , array]) => {
        let out: ReduceTo;

        if (outWrap.length === 1) {
            out = outWrap[0];
        } else {
            out = arrOp(array, ...params);
            outWrap = [out];
        }

        return out;
    };

    return [reduceCallbackFunction, arrOp([], ...params)];
}
