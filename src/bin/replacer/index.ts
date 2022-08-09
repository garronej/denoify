import { makeThisModuleAnExecutableReplacer } from "../../lib";

makeThisModuleAnExecutableReplacer(async params => {
    for (const { replacer } of await Promise.all([
        import("./fast-xml-parser"),
        import("./graphql"),
        import("./ipaddr.js"),
        import("./react"),
        import("./react-dom"),
        import("./rxjs")
    ] as const)) {
        const output = await replacer(params);

        if (output !== undefined) {
            return output;
        }
    }

    return undefined;
});
