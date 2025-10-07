import {useEffect, useState} from "react";

export function useToken() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token == null) {
            localStorage.removeItem("token");
        } else {
            localStorage.setItem("token", token);
        }
    }, [token])

    return { token, setToken };
}