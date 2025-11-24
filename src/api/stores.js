import {createApiStore} from "../util/createApiStore.js";

export const slotsStore = createApiStore("GET", "/slots")
export const guardRoomsStore = createApiStore("GET", "/guard-rooms")
export const userSlotHistoryStore = createApiStore("GET", "/user/slot-history")