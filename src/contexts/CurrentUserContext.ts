import { createContext } from "react";

export interface CurrentUserPresentation {
    userId: string | number;
    name: string;
    photoUrl?: string | null;
}

export const CurrentUserContext = createContext<CurrentUserPresentation | null>(null);
