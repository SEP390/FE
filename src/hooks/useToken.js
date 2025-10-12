import {createContext, useContext} from "react";

export const AuthContext = createContext();

export function useToken() {
    const {token, setToken} = useContext(AuthContext);
    return {token, setToken};
}