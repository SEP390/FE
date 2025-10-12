import {Card} from "antd";
import {Bed} from "lucide-react";
import React from "react";
import {cn} from "../../util/cn.js";

export function SlotCard({ data, selected, setSelected }) {
    const onClick = () => {
        if (data.status !== "AVAILABLE") return;
        setSelected(data);
        console.log(data);
    }

    return <>
        <Card onClick={onClick} hoverable={!selected && data.status === "AVAILABLE"} className={cn({
            "!bg-blue-50 !text-blue-600 !border-blue-50": selected,
            "cursor-pointer": !selected && data.status === "AVAILABLE",
            "!bg-gray-100 border !border-gray-200": data.status !== "AVAILABLE",
        }, "transition-all")}>
            <Bed/>
            <span>{data.slotName}</span>
        </Card>
    </>
}