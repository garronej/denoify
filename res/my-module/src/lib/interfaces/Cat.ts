

import type { Gender } from "../types";
import { Size } from "../types";

export interface Cat { 
    type: "CAT";
    color: import("../types").Color;
    gender: Gender;
    size: Size;
}

