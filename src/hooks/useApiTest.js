import {useCallback, useRef, useState} from "react";

/**
 * @param {function(payload: Object): {data: null | Object, error: null | string}} mock
 */
export function useApiTest(mock) {
    const [state, setState] = useState("init");
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const isLoading = state === "loading";
    const isSuccess = state === "success";
    const isError = state === "error";
    const isAbort = state === "abort";
    const isComplete = state === "success" || state === "error" || state === "abort";
    
    const request = useCallback((method, url, payload) => {
        console.log(method, url, payload)
        setData(null);
        setState("loading");
        setTimeout(() => {
            const response = mock(payload);
            if (response.data) {
                setState("success")
                setData(response.data)
            }
            if (response.error) {
                setState("error")
                setError(response.error)
            }
        }, 1000);
    }, [])

    const get = useCallback((url, payload = null) => request("GET", url, payload), [request]);
    const post = useCallback((url, payload) => request("POST", url, payload), [request]);
    const put = useCallback((url, payload) => request("PUT", url, payload), [request]);
    const del = useCallback((url) => request("DELETE", url, null), [request]);

    return { get, post, put, del, isLoading, isError, isSuccess, error, data, isComplete, isAbort }
}