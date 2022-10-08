import { ValidImportUrlResult } from "../../../../lib/resolveNodeModuleToDenoModule";

const parseGetValidImportUrlResultAsCouldConnect = (result: ValidImportUrlResult) => {
    switch (result.couldConnect) {
        case false:
            throw new Error("couldConnect of result cannot be false");
        case true:
            return result;
    }
};

const parseGetValidImportUrlResultAsCouldNotConnect = (result: ValidImportUrlResult) => {
    switch (result.couldConnect) {
        case false:
            throw new Error("couldConnect of result cannot be false");
        case true:
            return result;
    }
};

export { parseGetValidImportUrlResultAsCouldConnect, parseGetValidImportUrlResultAsCouldNotConnect };
