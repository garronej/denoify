import { Scheme } from "./Scheme";
export declare const getTsconfigOutDirIfDenoified: (params: {
    scheme: Scheme;
}) => Promise<{
    tsconfigOutDir: string | undefined;
}>;
