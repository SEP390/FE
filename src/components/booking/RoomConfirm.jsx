import {useApi} from "../../hooks/useApi.js";
import {Card, Skeleton} from "antd";
import {useEffect} from "react";
import {SlotCard} from "./SlotCard.jsx";
import {formatPrice} from "../../util/formatPrice.js";

/**
 * @typedef {{}} SlotRepsonse
 * @typedef {{
 * roomNumber: string,
 * dormName: string,
 * slots: SlotRepsonse[],
 * pricing: number
 * }} RoomResponse
 */

export function RoomConfirm({room, slot, setSlot}) {
    /**
     * @type {{data: RoomResponse[]}}
     */
    const {get, data, isSuccess} = useApi();

    useEffect(() => {
        get("/rooms/" + room.id)
    }, [get, room]);

    return <div className={"grid grid-cols-2 gap-3"}>
        <Card title={"Thông tin"}>
            <div className={"flex flex-col gap-4"}>
                <div className={"grid grid-cols-3"}>
                    <div>
                        <div className={"font-medium"}>Phòng</div>
                        <div>{room.roomNumber}</div>
                    </div>
                    <div>
                        <div className={"font-medium"}>Tòa</div>
                        <div className={"flex items-center gap-1 text-sm text-gray-600 mb-2"}>
                            {room.dormName}
                        </div>
                    </div>
                    <div>
                        <div className={"font-medium"}>Tầng</div>
                        <div>{room.floor}</div>
                    </div>
                </div>
                <div className={"flex flex-col gap-2"}>
                    <div className={"font-medium"}>Chọn slot</div>
                    <div className={"flex flex-wrap gap-2"}>
                        {!isSuccess && <Skeleton active/>}
                        {data && data.slots && data.slots
                            .sort((a, b) => a.slotName.localeCompare(b.slotName))
                            .map(s => <SlotCard
                                setSelected={setSlot}
                                selected={s.id === slot?.id}
                                key={s.id} data={s}/>)}
                    </div>
                </div>
            </div>
        </Card>
        <Card title={"Giá"}>
            <div>{!isSuccess && <Skeleton active />}</div>
            {isSuccess && <>
                <div className={"flex gap-1 items-center"}>
                    <div className={"text-2xl font-medium"}>{formatPrice(data.pricing)}</div>
                    <div>/ tháng</div>
                </div>
            </>}
        </Card>
    </div>
}