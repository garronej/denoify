

import type { Gender } from "../types/Gender/index.ts";
import { Size } from "../types/Size/index.ts";

export interface Dog {
    type: "DOG";
    color: import("../types/Color/index.ts").Color;
    gender: Gender;
    size: Size;
}

