import * as st from "scripting-tools";
import { addCache } from "../tools/addCache";
import { join as pathJoin, basename as pathBasename, dirname as pathDirname } from "path";
import * as fs from "fs";
import { assert } from "tsafe";

export function getInstalledVersionPackageJsonFactory(params: { projectPath: string }) {
    const { projectPath } = params;

    const getTargetModulePath = (params: { nodeModuleName: string }) => {
        const { nodeModuleName } = params;

        try {
            return st.find_module_path(nodeModuleName, projectPath);
        } catch {}

        return (function callee(thePath: string): string {
            const theDirname = pathDirname(thePath);

            assert(theDirname !== thePath);

            return pathBasename(theDirname) === "node_modules" ? thePath : callee(theDirname);
        })(require.resolve(nodeModuleName, { "paths": [projectPath] }));
    };

    /** Throw if not installed locally */
    const getInstalledVersionPackageJson = addCache(
        async (params: {
            nodeModuleName: string;
        }): Promise<{
            version: string;
            repository?: { url: string };
        }> => {
            const { nodeModuleName } = params;

            //NOTE: Can throw
            // node_modules/js-yaml
            const targetModulePath = getTargetModulePath({ nodeModuleName });

            return JSON.parse(
                await new Promise<string>((resolve, reject) =>
                    fs.readFile(pathJoin(targetModulePath, "package.json"), (err, buff) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(buff.toString("utf8"));
                    })
                )
            );
        }
    );

    return { getInstalledVersionPackageJson };
}
