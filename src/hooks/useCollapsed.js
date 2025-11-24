import {create} from "zustand";

export const useCollapsed = create(set => ({
    collapsed: false,
    setCollapsed: (collapsed) => set({collapsed}),
}))
