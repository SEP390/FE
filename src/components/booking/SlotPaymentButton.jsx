import {useMutation, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import useErrorNotification from "../../hooks/useErrorNotification.js";
import {Button} from "antd";

export function SlotPaymentButton({slotId, ...props}) {
    const queryClient = useQueryClient()
    const {mutate, error} = useMutation({
        mutationFn: ({slotId}) => axiosClient({
            url: "/booking",
            method: "POST",
            params: {slotId}
        }).then(res => res.data),
        onSuccess: async (data) => {
            window.open(data, '_blank')
            await queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })
    useErrorNotification(error)
    const onClick = async () => {
        mutate({slotId})
    }
    return <Button {...props} onClick={onClick}>Đặt chỗ</Button>
}
