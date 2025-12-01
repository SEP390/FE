import {Input} from "antd";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";
import {formatPrice} from "../util/formatPrice.js";

export function CurrentRoomInput({ userId }) {
    const {data} = useQuery({
        queryKey: ["slots", userId],
        queryFn: () => axiosClient.get("/slots", {
            params: { userId },
        }).then(res => res.data),
    })
    const slot = data && data.content.length > 0 ? data.content[0] : null;
    const room = slot?.room;
    const roomNumber = room?.roomNumber;
    const price = room?.pricing?.price;
    const value = room && `${roomNumber} | ${formatPrice(price)}`;
    return <Input disabled value={value}/>;
}