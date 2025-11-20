import {useEffect} from "react";
import {App} from "antd";

export default function useSuccessNotification({ data, message }) {
    const {notification} = App.useApp()
    useEffect(() => {
        if (data) notification.success({message})
    }, [data, message, notification]);
}