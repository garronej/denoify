

import type { Gender } from "../types/Gender";
import { Size } from "../types/Size";

export interface Dog {
    type: "DOG";
    color: import("../types/Color").Color;
    gender: Gender;
    size: Size;
}

