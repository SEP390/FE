import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Alert, Button, Card, Form, InputNumber, Tabs, Skeleton, notification} from "antd";
import {useApi} from "../../../hooks/useApi.js";
import {useEffect, useState} from "react";

const {TabPane} = Tabs;

const mockDorm = "4e8a9e06-548f-43cb-ac81-e253ccc1c96a";

function RoomButton({data, setSelect}) {
    const onClick = () => {
        console.log(data);
        setSelect(data)
    }
    return <>
        <Button onClick={onClick}>{data.roomNumber}</Button>
    </>
}

function FloorCard({ floor, data, setSelect }) {
    return <Card title={"Tầng " + floor}>
        <div className={"flex flex-wrap gap-2"}>
            {data.map(room => <RoomButton key={room.id} data={room} setSelect={setSelect}/>)}
        </div>
    </Card>
}

function RoomList({data, select, setSelect, setIsOpen}) {
    useEffect(() => {
        if (select) {
            setIsOpen(true);
        }
    }, [select])

    const floors = Object.groupBy(data, ({floor}) => floor);
    return <>
        <div className={"flex flex-col gap-2"}>
            {Object.entries(floors).map((floor, index) => <FloorCard setSelect={setSelect} key={index} floor={floor[0]} data={floor[1]} />)}
        </div>
    </>
}

function RoomSkeleton() {
    return <>
        <div className={"flex flex-col gap-2"}>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                </div>
            </Card>
        </div>
    </>
}

function CreateBillForm({ data, setSelect }) {
    const [form] = Form.useForm();

    const {post, data: response, error} = useApi();

    const onFinish = ({price, kw, m3}) => {
        post("/electric-water-room", {
            roomId: data.id,
            price, kw, m3
        })
    }

    useEffect(() => {
        if (response) {
            setTimeout(() => {
                setSelect(null)
            }, 2000);
        }
    }, [response, setSelect]);

    const errorMsg = {
        NO_USER_IN_ROOM: "Phòng không có người"
    }

    return <>
        <Card title={`Phòng ${data.roomNumber}`}>
            <Tabs type={"card"} defaultActiveKey={"FA25"}>
                <TabPane tab={"SU25"} key={"SU25"} />
                <TabPane tab={"FA25"} key={"FA25"}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        name="unit-price-form"
                        initialValues={{
                            kw_value: 0,
                            m3_value: 0,
                            price: 0.00,
                        }}
                    >
                        <Form.Item
                            layout="vertical"
                            name="kw"
                            label="Số điện (kW)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the energy value!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter="kW"
                            />
                        </Form.Item>
                        <Form.Item
                            layout="vertical"
                            name="m3"
                            label="Khối (m3)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the volume value!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter={<span>m&sup3;</span>}
                            />
                        </Form.Item>
                        <Form.Item
                            layout="vertical"
                            name="price"
                            label="Giá"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the price!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter="VND" // Add the currency symbol as a prefix
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Format as currency
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')} // Parse back to number
                            />
                        </Form.Item>
                        <Form.Item>
                            <div className={"flex gap-2"}>
                                <Button type={"primary"} htmlType={"submit"}>Cập nhật</Button>
                                <Button onClick={() => setSelect(null)}>Hủy</Button>
                            </div>
                        </Form.Item>
                    </Form>
                    {error && <Alert type={"error"} message={"Lỗi"} description={errorMsg[error] ? errorMsg[error] : error} />}
                    {response && <Alert type={"success"} message={"Tạo thành công"} />}
                </TabPane>
            </Tabs>
        </Card>
    </>
}

export function GuardElectricWaterPage() {
    const {get, data, error, isError} = useApi();

    const [select, setSelect] = useState(null);

    const [notif, notifEl] = notification.useNotification();

    useEffect(() => {
        get(`/dorms/${mockDorm}/rooms`);
    }, [get]);

    useEffect(() => {
        if (isError) {
            notif.error({ message: error });
        }
    }, [isError]);

    const content = !select ? <>
        {data && <RoomList select={select} setSelect={setSelect} data={data} />}
        {!data && <RoomSkeleton />}
    </> : <>
        <CreateBillForm setSelect={setSelect} data={select} />
    </>

    return <>
        <AppLayout>
            {notifEl}
            <Card className={"h-full overflow-auto"} title={"Hóa đơn điện nước"}>
                {content}
            </Card>
        </AppLayout>
    </>
}