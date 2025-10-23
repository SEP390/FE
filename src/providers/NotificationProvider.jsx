import {NotifContext} from "../hooks/useNotif.js";
import {notification} from "antd";

export function NotificationProvider({ children }) {
    const [notifApi, notifHolder] = notification.useNotification();
    return <NotifContext.Provider value={notifApi}>
        {notifHolder}
        {children}
    </NotifContext.Provider>
}