import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Button, Card, Form, InputNumber, Modal} from "antd";
import {useApi} from "../../hooks/useApi.js";
import React, {useEffect, useState} from "react";

const mockDorm = "de451d96-cef9-415b-be2f-c9520694b480";

function RoomModal({ isOpen, setIsOpen, room }) {
    const onClose = () => {
        setIsOpen(false);
    }

    const [form] = Form.useForm();

    const { get, data} = useApi();
    const { post, data: bill, error } = useApi();

    const onFinish = (values) => {

        post("/electric-water-room", {
            ...values,
            roomId: room.id
        })
    }

    useEffect(() => {
        if (!room) return;
        get("/electric-water-room/" + room.id)
    }, [room]);

    if (!room) return <></>

    return <Modal
        width={"1000px"}
        title={"Hóa đơn điện nước phòng " + room.roomNumber}
        closable={{'aria-label': 'Custom Close Button'}}
        open={isOpen}
        onOk={onClose}
        onCancel={onClose}
        footer={[
            <Button key="back" onClick={onClose}>Hủy</Button>,
            <Button onClick={() => {form.submit()}} type={"primary"} key="submit">Cập nhật</Button>
        ]}>
        <Form
            form={form}
            name="unit-price-form"
            initialValues={{
                kw_value: 0,
                m3_value: 0,
                price: 0.00,
            }}
            onFinish={onFinish}
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
        </Form>
        <div className={"mt-3"}>
            {error && <div className={"text-red-600"}>{error}</div>}
        </div>
    </Modal>
}

function RoomDisplay({data, setSelect}) {
    const onClick = () => {
        console.log(data);
        setSelect(data)
    }

    return <>
        <Button onClick={onClick}>{data.roomNumber}</Button>
    </>
}

function FloorDisplay({ floor, data, setSelect }) {
    return <Card title={"Tầng " + floor}>
        <div className={"flex flex-wrap gap-2"}>
            {data.map(room => <RoomDisplay key={room.id} data={room} setSelect={setSelect}/>)}
        </div>
    </Card>
}

function RoomList({data}) {
    const [select, setSelect] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (select) {
            setIsOpen(true);
        }
    }, [select])

    const floors = Object.groupBy(data, ({floor}) => floor);
    return <>
        <RoomModal isOpen={isOpen} setIsOpen={setIsOpen} room={select}/>
        <div className={"flex flex-col gap-2"}>
            {Object.entries(floors).map((floor, index) => <FloorDisplay setSelect={setSelect} key={index} floor={floor[0]} data={floor[1]} />)}
        </div>
    </>
}

export function GuardElectricWaterPage() {
    const {get, data} = useApi();

    useEffect(() => {
        get(`/dorms/${mockDorm}/rooms`);
    }, []);

    return <>
        <AppLayout>
            <Card className={"h-full overflow-auto"} title={"Hóa đơn điện nước"}>
                {data && <RoomList data={data} />}
            </Card>
        </AppLayout>
    </>
}