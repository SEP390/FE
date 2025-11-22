import {useEffect} from "react";
import {App} from "antd";

export function useViewEffect(store, errorMap) {
    const fetch = store(state => state.fetch)
    const error = store(state => state.error)
    useEffect(() => {
        fetch()
    }, [fetch])
    const {notification} = App.useApp()
    useEffect(() => {
        if (error) notification.error({message: errorMap?.[error] || error})
    }, [error, errorMap, notification]);
}