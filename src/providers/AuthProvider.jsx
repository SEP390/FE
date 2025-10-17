import {AuthContext} from "../hooks/useToken.js";
import {useEffect, useState} from "react";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    useEffect(() => {
        // tmp fix for "null" token
        if (token || token === "null") {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);
    return <AuthContext.Provider value={{token, setToken}}>{children}</AuthContext.Provider>;
}