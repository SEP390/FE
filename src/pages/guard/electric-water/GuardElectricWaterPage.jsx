import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Alert, Button, Card, Form, InputNumber, notification, Skeleton, Tabs} from "antd";
import {useApi} from "../../../hooks/useApi.js";
import {createContext, useContext, useEffect, useState} from "react";
import {ChevronLeft} from "lucide-react";

const {TabPane} = Tabs;

const mockDorm = "4e8a9e06-548f-43cb-ac81-e253ccc1c96a";

const NotificationContext = createContext();

function NotificationProvider({ children }) {
    const [notificationInstance, notificationHolder] = notification.useNotification();
    return <NotificationContext.Provider value={notificationInstance}>
        {notificationHolder}
        {children}
    </NotificationContext.Provider>;
}

function useNotification() {
    return useContext(NotificationContext);
}

function RoomButton({data, setSelect}) {
    const onClick = () => {
        console.log(data);
        setSelect(data)
    }
    return <>
        <Button onClick={onClick}>{data.roomNumber}</Button>
    </>
}

function FloorCard({floor, data, setSelect}) {
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
            {Object.entries(floors).map((floor, index) => <FloorCard setSelect={setSelect} key={index} floor={floor[0]}
                                                                     data={floor[1]}/>)}
        </div>
    </>
}

function RoomSkeleton() {
    return <>
        <div className={"flex flex-col gap-2"}>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                    <Skeleton.Button active/>
                </div>
            </Card>
        </div>
    </>
}

function IndexFormItems({ disable = false }) {
    return <>
        <Form.Item
            name="electricIndex"
            label="Số điện (kW)"
            rules={[
                {
                    required: true,
                    message: 'Nhập số điện!',
                },
            ]}
        >
            <InputNumber
                disabled={disable}
                addonAfter="kW"
            />
        </Form.Item>
        <Form.Item
            name="waterIndex"
            label="Số nước (m3)"
            rules={[
                {
                    required: true,
                    message: 'Nhập số nước!',
                },
            ]}
        >
            <InputNumber
                disabled={disable}
                addonAfter={<span>m&sup3;</span>}
            />
        </Form.Item>
    </>
}

function UpdateIndex({initValues, setEdit, fetchData}) {
    const [form] = Form.useForm();

    const {put, data, error} = useApi();

    const onFinish = ({ electricIndex, waterIndex }) => {
        put("/electric-water-index", {
            id: initValues.id,
            electricIndex,
            waterIndex
        })
    }

    useEffect(() => {
        if(data) {
            setEdit(false);
            fetchData();
        }
    }, [data]);

    return <>
        <Form
            form={form}
            layout={"vertical"}
            onFinish={onFinish}
            initialValues={initValues}
        >
            <IndexFormItems />
            <Form.Item>
                <div className={"flex gap-2"}>
                    <Button htmlType={"submit"}>Cập nhật</Button>
                    <Button onClick={() => setEdit(false)}>Hủy</Button>
                </div>
            </Form.Item>
        </Form>
        {error && <Alert type={"error"} message={"Lỗi"} description={error}/>}
    </>
}

function CreateIndex({room, semester, fetchData, setEdit}) {
    const [form] = Form.useForm();

    const {post, data, error} = useApi();

    const onFinish = ({ electricIndex, waterIndex }) => {
        post("/electric-water-index", {
            roomId: room.id,
            semesterId: semester.id,
            electricIndex,
            waterIndex
        })
    }

    useEffect(() => {
        if(data) {
            setEdit(false);
            fetchData();
        }
    }, [data]);

    return <>
        <Form
            form={form}
            layout={"vertical"}
            onFinish={onFinish}
        >
            <IndexFormItems />
            <Form.Item>
                <div className={"flex gap-2"}>
                    <Button htmlType={"submit"}>Tạo</Button>
                </div>
            </Form.Item>
        </Form>
        {error && <Alert type={"error"} message={"Lỗi"} description={error}/>}
    </>
}

function CreateBillButton({index, onSuccess}) {
    const {post, data, error} = useApi();

    const notif = useNotification();

    const createBill = () => {
        post("/electric-water-bill", {
            indexId: index.id
        })
    }

    useEffect(() => {
        data && onSuccess(data);
    }, [data]);

    useEffect(() => {
        error && notif.error({ message: "Lỗi", description: error, placement: "topLeft"})
    }, [error]);

    return <>
        <Button onClick={createBill}>Tạo hóa đơn</Button>
    </>
}

function IndexInfo({room, semester}) {
    const {get, data, error} = useApi();

    const [edit, setEdit] = useState(false);

    const fetchData = () => {
        get("/electric-water-index", {
            roomId: room.id,
            semesterId: semester.id,
        })
    }

    useEffect(() => {
        error && notif.error({ message: "Lôi", description: error})
    }, [error]);

    const onBillCreated = () => {

    }

    useEffect(() => {
        fetchData();
    }, [room, semester]);

    if (!data) return <CreateIndex initValues={data} setEdit={setEdit} room={room} semester={semester} fetchData={fetchData}/>
    if (data && edit) return <UpdateIndex initValues={data} setEdit={setEdit} room={room} semester={semester} fetchData={fetchData}/>

    return <>
        <Form layout={"vertical"} initialValues={{
            electricIndex: data && data.electricIndex,
            waterIndex: data && data.waterIndex
        }}>
            <IndexFormItems disable={true}/>
            <Form.Item>
                <div className={"flex gap-3"}>
                    <Button onClick={() => setEdit(true)}>Sửa</Button>
                    {data && <CreateBillButton index={data} onSuccess={onBillCreated} />}
                </div>
            </Form.Item>
        </Form>
    </>
}

function RoomIndexInfo({room, setSelect}) {
    const {get, data, error} = useApi();

    const notif = useNotification();

    const [currentSemester, setCurrentSemester] = useState(null);

    useEffect(() => {
        get("/semesters", {
            sort: [
                ["startDate", "DESC"],
            ]
        })
    }, []);

    useEffect(() => {
        error && notif.error({ message: "Lôi", description: error})
    }, [error]);

    useEffect(() => {
        data && setCurrentSemester(data.at(-1));
    }, [data]);

    const semesters = data ? Object.fromEntries(data.map(semester => [semester.id, semester])) : {};

    return <>
        <Card title={<>
            <div className={"flex items-center gap-2"}>
                <Button onClick={() => setSelect(null)} size={"small"} variant={"filled"}><ChevronLeft size={14} /></Button>
                <span>Phòng {room.roomNumber}</span>
            </div>
        </>}>
            <Tabs onChange={(id) => setCurrentSemester(semesters[id])} type={"card"} activeKey={currentSemester ? currentSemester.id : ""}>
                {data && data.map(semester => <>
                    <TabPane tab={semester.name} key={semester.id}>
                        <IndexInfo room={room} semester={semester}/>
                    </TabPane>
                </>)}
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
            notif.error({message: error});
        }
    }, [isError]);

    const content = !select ? <>
        {data && <RoomList select={select} setSelect={setSelect} data={data}/>}
        {!data && <RoomSkeleton/>}
    </> : <>
        <RoomIndexInfo setSelect={setSelect} room={select}/>
    </>

    return <>
        <NotificationProvider>
            <AppLayout>
                {notifEl}
                <Card className={"h-full overflow-auto"} title={"Hóa đơn điện nước"}>
                    {content}
                </Card>
            </AppLayout>
        </NotificationProvider>
    </>
}