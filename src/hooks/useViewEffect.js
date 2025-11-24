import {useEffect} from "react";
import {App} from "antd";

export function useViewEffect(store) {
    const {fetch, mutate, data, error, isLoading, isError, isSuccess} = store()
    useEffect(() => {
        fetch()
    }, [fetch])
    const {notification} = App.useApp()
    useEffect(() => {
        if (error) notification.error({message: error})
    }, [error, notification]);
    return {fetch, mutate, data, error, isLoading, isError, isSuccess}
}