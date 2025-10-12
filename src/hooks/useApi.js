import axiosClient from "../api/axiosClient/axiosClient.js";
import {useCallback, useEffect, useMemo, useState} from "react";

export function useApi() {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";

    const controllerRef = useMemo(() => ({ current: null }), []);

    useEffect(() => {
        data && console.log(data)
    }, [data]);

    const request = useCallback((method, url, data) => {
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
            method, url, data, signal: signal,
        }).then(res => {
            setState("success");
            setData(res.data);
            console.log(res.data)
        }).catch(err => {
            setState("error");
            setError(err?.message || err?.response?.data);
        })
    }, [controllerRef])

    const get = useCallback((url, payload = null) => request("GET", url, payload), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);

    return { get, post, put, del, isLoading, isError, isSuccess, error, data }
}