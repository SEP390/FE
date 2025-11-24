import {useEffect, useRef} from "react";
import {App} from "antd";

export function useUpdateEffect(store, message = "Thành công") {
    const {fetch, mutate, data, error, isLoading, isError, isSuccess} = store()
    const {notification} = App.useApp()
    useEffect(() => {
        if (isError) {
            notification.error({message: error})
        }
    }, [isError, error, notification]);
    useEffect(() => {
        if (isSuccess) {
            notification.success({message: message})
        }
    }, [isSuccess, data, notification]);
    return {fetch, mutate, data, error, isLoading, isError, isSuccess}
}
