
import { consumeExecutableReplacerFactory } from "../lib/replacer";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";

const { consumeExecutableReplacer } = consumeExecutableReplacerFactory({
    "filePath": path.join(__dirname, "..", "bin", "replacer", "index.js")
});


(async () => {

    const output = await consumeExecutableReplacer({
        "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"') as any,
        "version": "1.8.1"
    });

    assert(
        output,
        [
            `// @deno-types="https://raw.githubusercontent.com/whitequark/ipaddr.js/v1.8.1/lib/ipaddr.js.d.ts"`,
            `import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`
        ].join("\n")
    );

    console.log("PASS");

})();





