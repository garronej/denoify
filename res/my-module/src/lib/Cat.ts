
import * as interfaces from "./interfaces";
import { EventEmitter } from "events";
import * as runExclusive from "run-exclusive";
import { buildMethod } from "run-exclusive/dist/lib/runExclusive";

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