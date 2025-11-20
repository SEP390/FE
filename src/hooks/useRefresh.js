import {create} from "zustand";

export const useRefresh = create((set, get) => ({
    onRefresh: 0,
    refresh: () => set({
        onRefresh: get().onRefresh + 1
    }),
}))