import {useEffect, useRef} from "react";
import {App} from "antd";

export function useUpdateEffect(store, message = "Thành công", errorMap = {}) {
    const error = store(state => state.error)
    const data = store(state => state.data)
    const isError = store(state => state.isError)
    const isSuccess = store(state => state.isSuccess)
    const {notification} = App.useApp()
    const opts = useRef({message, errorMap})
    useEffect(() => {
        if (isError) {
            const {errorMap} = opts.current
            console.log("opts:", opts.current)
            console.log("error", error)
            notification.error({message: errorMap?.[error] || error})
        }
    }, [isError, error, notification]);
    useEffect(() => {
        if (isSuccess) {
            if (typeof(opts.current.message) === "string") notification.success({message: opts.current.message})
            else {
                notification.success({message: opts.current.message(data)})
            }
        }
    }, [isSuccess, data, notification]);
}
