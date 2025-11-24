import {useEffect} from "react";
import {App} from "antd";

export function useApiStore(store) {
    const {fetch, mutate, data, error, isLoading, isError, isSuccess, setUrl} = store()
    const {notification} = App.useApp()
    useEffect(() => {
        if (error) notification.error({message: error})
    }, [error, notification]);
    return {fetch, mutate, data, error, isLoading, isError, isSuccess, setUrl}
}
