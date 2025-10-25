import axiosClient from "../api/axiosClient/axiosClient.js";
import {useCallback, useState} from "react";

export function useApi() {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [errorData, setErrorData] = useState(null);
    const [data, setData] = useState(null);
    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";
    const isComplete = state === "success" || state === "error";
    const request = useCallback((method, url, data) => {
        console.log(method, url, data);
        setData(null);
        setError(null);
        setState("loading");
        axiosClient({
            method, url, data, params: method === "GET" ? data : null, timeout: 3000
        }).then(res => {
            setState("success");
            setData(res.data);
            console.log(res.data)
        }).catch(err => {
            setState("error");
            setError(err?.response?.data?.message || err.message);
            setErrorData(err?.response?.data);
            console.log(err)
        })
    }, [])
    const get = useCallback((url, payload = null) => request("GET", url, payload), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);
    return { get, post, put, del, isLoading, isError, isSuccess, error, errorData, data, isComplete }
}