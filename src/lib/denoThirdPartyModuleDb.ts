
import fetch from "node-fetch";
import { urlJoin } from "../tools/urlJoin";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";


type DenoThirdPartyModuleDbEntry = {
    type: "github";
    owner: string;
    repo: string;
    desc: string;
    default_version: string;
}

namespace DenoThirdPartyModuleDbEntry {

    export function match(entry: any): entry is DenoThirdPartyModuleDbEntry {

        return (
            entry instanceof Object &&
            entry.type === "github" &&
            typeof entry.owner === "string" &&
            typeof entry.repo === "string" &&
            typeof entry.desc === "string" &&
            typeof entry.default_version === "string"
        );

    }

}

let database: Record<string, DenoThirdPartyModuleDbEntry> | undefined = undefined;

export async function getDenoThirdPartyModuleDatabase(): Promise<NonNullable<typeof database>>{

    if (database === undefined) {

        const owner = "denoland";
        const repo = "deno_website2";

        const unfilteredDatabase = JSON.parse(
            await fetch(
                urlJoin(
                    "https://raw.githubusercontent.com",
                    owner,
                    repo,
                    await getGithubDefaultBranchName({ owner, repo }),
                    "database.json"
                )
            )
                .then(res => res.text())
        ) as Record<string, any>;

        database = {};

        for( const moduleName in unfilteredDatabase ){

            const entry = unfilteredDatabase[moduleName];

            if( !DenoThirdPartyModuleDbEntry.match(entry)){
                continue;
            }

            database[moduleName]= entry;
        }

    }

    return database;


}





