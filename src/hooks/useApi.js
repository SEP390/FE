import axiosClient from "../api/axiosClient/axiosClient.js";
import {useCallback, useRef, useState} from "react";

export function useApi() {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [errorData, setErrorData] = useState(null);
    const [data, setData] = useState(null);
    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";
    const isComplete = state === "success" || state === "error";
    const abortController = useRef(null);
    const request = useCallback((method, url, data) => {
        if (abortController.current) {
            // cancel previous request
            abortController.current.abort()
        } else {
            // first request
            console.log(method, url, data);
        }
        abortController.current = new AbortController();
        setState("loading");
        axiosClient({
            method,
            url,
            data,
            params: method === "GET" ? data : null,
            timeout: 3000,
            signal: abortController.current.signal
        }).then(res => {
            if (res.status === 200) {
                setState("success");
                setData(res.data);
                console.log(res)
            } else {
                setState("error");
                setError(res.message)
                setErrorData(res.data)
                console.log(res)
            }
        }).catch(err => {
            if (err.code === "ERR_CANCELED") {
                return;
            }
            setState("error");
            const errorCode = err?.response?.data?.message || err?.response?.data || err.message
            const errorData = err?.response?.data
            setError(errorCode);
            if (errorData) setErrorData(errorData)
            console.log(errorCode, errorData)
        }).finally(() => {
            // finish request, clear abort controller
            abortController.current = null;
        })
    }, [])
    const get = useCallback((url, payload = null) => request("GET", url, payload), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);
    return {get, post, put, del, isLoading, isError, isSuccess, error, errorData, data, isComplete}
}