import {AuthContext} from "./useToken.js";
import {useContext} from "react";

export function useProfile() {
    const { profile } = useContext(AuthContext);
    return { profile }
}