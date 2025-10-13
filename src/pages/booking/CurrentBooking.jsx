import {Button, Card, Descriptions, Empty, List, Tag, Typography} from "antd";
import {Clock3, Info} from "lucide-react";
import {formatPrice} from "../../util/formatPrice.js";
import {useEffect} from "react";
import {useApi} from "../../hooks/useApi.js";

const { Title, Text } = Typography;

const getStatusTag = (status) => {
    switch (status.toUpperCase()) {
        case 'PENDING':
            return { color: 'gold', icon: <Clock3 size={14} /> };
        case 'ACTIVE':
            return { color: 'green', icon: <CheckCircle size={14} /> };
        case 'CLOSED':
            return { color: 'red', icon: <XCircle size={14} /> };
        default:
            return { color: 'default', icon: <Info size={14} /> };
    }
};

export function CurrentBooking({ data }) {

    const { color, icon } = getStatusTag(data.status);

    const {get, data: roommates} = useApi();

    useEffect(() => {
        if (data) {
            get(`/rooms/${data.room.id}/roommates`)
        }
    }, [data]);

    return <>
        <Card title={"Thông tin phòng hiện tại"} className={"h-full"}>
            <Descriptions bordered className={"!mb-5"}>
                <Descriptions.Item label="Slot">
                    {data?.slotName}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                    {data?.room?.roomNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Tòa">
                    {data?.room?.dorm?.dormName}
                </Descriptions.Item>
                <Descriptions.Item label="Tầng">
                    {data?.room?.floor}
                </Descriptions.Item>
                <Descriptions.Item label="Kỳ">
                    <Tag>{data?.semester?.semesterName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                    <div>{formatPrice(data.price)}</div>
                </Descriptions.Item>
            </Descriptions>
            <div>
                {data && data.status === "PENDING" && <>
                    <Button type={"primary"}>Thanh toán</Button>
                </>}
            </div>
            <div>
                {roommates && <>
                    <Card title={"Bạn cùng phòng"}>
                        {roommates.length === 0 && <Empty />}
                        <List>
                            {roommates.map((rm) => <List.Item key={rm.id}>
                                <div className={"flex gap-2"}>
                                    <span>{rm.email}</span><Tag>Match {rm.matching}%</Tag>
                                </div>
                            </List.Item>)}
                        </List>
                    </Card>
                </>}
            </div>
        </Card>
    </>
}