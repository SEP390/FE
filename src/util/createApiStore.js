import axiosClient from "../api/axiosClient/axiosClient.js";
import {create} from "zustand";

export function createApiStore(method, url, payload = null) {
    return create((set, get) => ({
        isLoading: false,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
        errorData: null,
        payload: payload,
        mutate: async (payload) => {
            set({payload})
            await get().fetch()
        },
        fetch: async () => {
            const payload = get().payload;
            console.log(method, url, payload)
            try {
                set({isLoading: true, isSuccess: false, isError: false})
                const res = await axiosClient({
                    method,
                    url,
                    data: payload,
                    params: method === "GET" ? payload : null,
                });
                set({data: res.data, isLoading: false, isSuccess: true})
            } catch (e) {
                const error = e.response?.data?.message || e.message;
                const errorData = e.response?.data
                set({error, errorData, isLoading: false, isError: true})
            }
        }
    }))
}
