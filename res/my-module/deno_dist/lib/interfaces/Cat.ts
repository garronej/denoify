

import type { Gender } from "../types/index.ts";
import { Size } from "../types/index.ts";

export interface Cat { 
    type: "CAT";
    color: import("../types/index.ts").Color;
    gender: Gender;
    size: Size;
}

