import axiosClient from "../api/axiosClient/axiosClient.js";
import {useCallback, useState} from "react";

export function useApi() {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";

    const request = useCallback((method, url, data) => {
        console.log(method, url, data);
        setError(null);
        setState("loading");
        axiosClient({
            method, url, data
        }).then(res => {
            setState("success");
            setData(res.data);
        }).catch(err => {
            setState("error");
            setError(err?.message || err?.response?.data);
        })
    }, [])

    const get = useCallback((url) => request("GET", url, null), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);

    return { get, post, put, del, isLoading, isError, isSuccess, error, data }
}