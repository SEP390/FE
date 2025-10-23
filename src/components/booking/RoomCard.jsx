import {Button, Card, Tag} from "antd";
import {MapPin} from "lucide-react";

const formatPrice = (price) => Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(price);

export function RoomCard({ data, setSelected, setIsOpen }) {
    const matchColor = data.matching > 75 ? 'green' : data.matching > 50 ? 'blue' : 'orange';

    const onSelect = () => {
        setSelected(data);
        setIsOpen(true);
    }

    return (
        <Card className={"w-100"}>
            <div className={"flex"}>
                <div className={"flex flex-col gap-3"}>
                    <div>
                        <div className={"font-medium text-2xl"}>{data.roomNumber}</div>
                        <div className={"flex gap-1 items-center"}>
                            <MapPin size={16} className={"text-gray-500"} />
                            <span className={"text-gray-500"}>{data.dormName}, Tầng {data.floor}</span>
                        </div>
                    </div>
                    <div className={"text-gray-600 border-l-2 pl-3 border-gray-300"}>
                        Phòng {data.totalSlot} giường
                    </div>
                </div>
                <div className={"ml-auto"}>
                    <div className={"flex flex-col gap-3 items-end"}>
                        <div>
                            <Tag color={matchColor} className="text-sm font-semibold">{data.matching}% Match</Tag>
                        </div>
                        <div className={"flex flex-col items-end"}>
                            <div className={"text-2xl font-medium"}>{formatPrice(data.pricing.price)}</div>
                            <div className={"text-gray-500"}>/ 1 tháng</div>
                        </div>
                        <div className={"mt-auto"}>
                            <Button onClick={onSelect} type={"primary"}>Chi tiết</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}