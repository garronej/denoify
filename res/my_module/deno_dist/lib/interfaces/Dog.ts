

import type { Gender } from "../types/Gender.ts";
import { Size } from "../types/Size.ts";

export interface Dog {
    type: "DOG";
    color: import("../types/Color.ts").Color;
    gender: Gender;
    size: Size;
}

