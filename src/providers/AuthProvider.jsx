import {AuthContext} from "../hooks/useToken.js";
import {useEffect, useState} from "react";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function AuthProvider({children}) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [profile, setProfile] = useState(null);
    useEffect(() => {
        // tmp fix for "null" token
        if (!token || token === "null") {
            localStorage.removeItem("token");
        } else {
            localStorage.setItem("token", token);
            axiosClient({
                method: "GET",
                url: "/users/profile",
            }).then(res => {
                setProfile(res.data);
            }).catch(err => {
            });
        }
    }, [token]);
    return <AuthContext.Provider value={{token, setToken, profile}}>{children}</AuthContext.Provider>;
}