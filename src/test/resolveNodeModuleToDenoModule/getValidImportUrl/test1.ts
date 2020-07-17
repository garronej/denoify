
import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "evt/tools/typeSafety";

(async () => {

    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    } as const;

    for (const prefix of ["", "github:"]) {

        assert(
            inDepth.same(
                ModuleAddress.parse(`${prefix}garronej/ts-md5`),
                moduleAddress
            )
        );

        assert(
            inDepth.same(
                ModuleAddress.parse(`${prefix}garronej/ts-md5#1.2.7`),
                {
                    ...moduleAddress,
                    "branch": "1.2.7"
                }
            )
        );

    }

    console.log("PASS");


})();