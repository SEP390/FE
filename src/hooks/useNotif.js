import {createContext, useContext} from "react";

export const NotifContext = createContext();

export function useNotif() {
    return useContext(NotifContext);
}