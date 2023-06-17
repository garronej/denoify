import { knownPorts } from "./knownPorts";
import { Dependencies } from "./resolveNodeModuleToDenoModule";

export const getDenoPorts = (userProvidedPorts: Dependencies) => {
    const denoPorts: Dependencies = {};

    [knownPorts.third_party, knownPorts.builtins, userProvidedPorts].forEach(record =>
        Object.keys(record).forEach(nodeModuleName => (denoPorts[nodeModuleName] = record[nodeModuleName]))
    );

    return denoPorts;
};
