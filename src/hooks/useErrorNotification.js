import {useEffect} from "react";
import {App} from "antd";

export default function useErrorNotification(error) {
    const {notification} = App.useApp()
    useEffect(() => {
        if (error) notification.error({message: error?.response?.data?.message || error?.message || error})
    }, [error, notification]);
}