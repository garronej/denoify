const BUFFER_IS_USED = /(?:^|[\s\(\);=><{}\[\]\/:?,])Buffer(?:$|[^a-zA-Z0-9$_-])/;
const BUFFER_IS_IMPORTED = /import\s*{[^}]*Buffer[^}]*}\s*from\s*["'][^"']+["']/;

export const test = (sourceCode: string) => BUFFER_IS_USED.test(sourceCode) && !BUFFER_IS_IMPORTED.test(sourceCode);

export const modification = [`import { Buffer } from "buffer";`];
