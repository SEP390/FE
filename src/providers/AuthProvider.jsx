import {AuthContext} from "../hooks/useToken.js";
import {useEffect, useState} from "react";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    useEffect(() => {
        localStorage.setItem("token", token);
    }, [token]);
    return <AuthContext.Provider value={{token, setToken}}>{children}</AuthContext.Provider>;
}