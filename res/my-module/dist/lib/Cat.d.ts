import * as interfaces from "./interfaces";
export declare class Cat implements interfaces.Cat {
    type: "CAT";
    color: "BLACK";
    gender: "FEMALE";
    size: "SMALL";
    run: () => Promise<number>;
    makeSound: () => Promise<string>;
}
export declare function createCat(): interfaces.Cat;
