
import * as interfaces from "./interfaces/index.ts";
import * as runExclusive from "https://deno.land/x/run_eclusive/mod.ts";
import { buildMethod } from "https://deno.land/x/run_eclusive/deno_dist/lib/runExclusive.ts";
import { load } from "https://deno.land/x/js_yaml_port/js-yaml.js";

console.log(load('hello: world')); // => prints { hello: "world" }

export class Cat implements interfaces.Cat {

    type = "CAT" as const;
    color = "BLACK" as const;
    gender = "FEMALE" as const;
    size = "SMALL" as const;


    run = runExclusive.buildMethod(async (): Promise<number> => {

        const time = ~~(Math.random() * 10);

        await new Promise(resolve => setTimeout(resolve, time));

        return time;

    });

    makeSound = buildMethod(async (): Promise<string> => {


        await new Promise(resolve => setTimeout(resolve, 100));

        return "SOUND";

    });


}

export function createCat(): interfaces.Cat {
    return {
        "type": "CAT",
        "color": "BLACK",
        "gender": "FEMALE",
        "size": "SMALL"
    };
}