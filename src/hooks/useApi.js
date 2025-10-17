import axiosClient from "../api/axiosClient/axiosClient.js";
import {useCallback, useMemo, useState} from "react";

export function useApi() {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";
    const isAbort = state === "abort";
    const isComplete = state === "success" || state === "error" || state === "abort";

    const controllerRef = useMemo(() => ({ current: null }), []);

    const request = useCallback((method, url, data) => {
        setData(null);
        if (controllerRef.current) {
            controllerRef.current.abort();
        } else {
            console.log(method, url, data);
        }
        const controller = new AbortController();
        controllerRef.current = controller;
        const signal = controller.signal;

        setError(null);
        setState("loading");
        axiosClient({
            method, url, data, signal: signal, params: method === "GET" ? data : null
        }).then(res => {
            setState("success");
            setData(res.data);
            console.log(res.data)
        }).catch(err => {
            if (err.name === "CanceledError") {
                setState("abort");
            } else {
                console.log(err)
                setState("error");
                setError(err?.response?.data?.message || err.message);
            }
        }).finally(() => {
            controllerRef.current = null;
        })
    }, [controllerRef])

    const get = useCallback((url, payload = null) => request("GET", url, payload), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);

    return { get, post, put, del, isLoading, isError, isSuccess, error, data, isComplete, isAbort }
}