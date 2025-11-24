import axiosClient from "../api/axiosClient/axiosClient.js";
import {create} from "zustand";

export function createApiStore(method, url, payload = null) {
    return create((set, get) => ({
        url: url,
        isLoading: false,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
        errorData: null,
        payload: payload,
        setUrl: (url) => set({url}),
        mutate: async (payload) => {
            set({payload})
            await get().fetch()
        },
        fetch: async () => {
            const payload = get().payload;
            const url = get().url;
            console.log(method, url, payload)
            try {
                set({isLoading: true, isSuccess: false, isError: false, error: null, errorData: null})
                const res = await axiosClient({
                    method,
                    url,
                    data: payload,
                    params: method === "GET" ? payload : null,
                });
                console.log(res)
                set({data: res.data, isLoading: false, isSuccess: true, error: null, errorData: null, isError: false})
            } catch (e) {
                const error = e.response?.data?.message || e.message;
                const errorData = e.response?.data
                console.log(e)
                set({error, errorData, isLoading: false, isError: true, isSucess: false})
            }
        }
    }))
}
