
import { makeThisModuleAnExecutableReplacer } from "../../lib";

makeThisModuleAnExecutableReplacer(
    async params => {

        for (
            const { replacer }
            of 
            await Promise.all([
                import("./ipaddr.js")
            ] as const)
        ) {

            const output = await replacer(params);

            if( output !== undefined ){
                return output;
            }

        }

        return undefined;

    }
);