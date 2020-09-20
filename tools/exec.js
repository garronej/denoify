"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execFactory = void 0;
const st = require("scripting-tools");
function execFactory(params) {
    const { isDryRun } = params;
    const exec = !isDryRun ?
        (async (cmd) => {
            console.log(`$ ${cmd}`);
            await st.exec(cmd);
        })
        :
            (cmd => {
                console.log(`(dry)$ ${cmd}`);
                return Promise.resolve();
            });
    return { exec };
}
exports.execFactory = execFactory;
//# sourceMappingURL=exec.js.map