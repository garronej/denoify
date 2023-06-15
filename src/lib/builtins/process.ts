const PROCESS_IS_USED = /process\./;

export const test = (sourceCode: string) => PROCESS_IS_USED.test(sourceCode);

export const modification = [`import process from "node:process";`];
