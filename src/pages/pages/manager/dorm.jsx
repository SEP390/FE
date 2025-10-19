import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Button, Card, Table} from "antd";
import {useApi} from "../../../hooks/useApi.js";
import {useEffect} from "react";
import {Link} from "react-router-dom";
import {Plus, PlusIcon} from "lucide-react";

/**
 * @typedef {Object} DormResponse
 * @property {string} uuid
 * @property {number} totalFloor
 * @property {number} totalRoom
 */

export default function Dorm() {
    const { get, data, error } = useApi();

    /**
     * @type import("antd").TableColumnsType
     */
    const columns = [
        {
            title: 'Dorm',
            key: 'id',
            dataIndex: 'dormName',
        },
        {
            title: "Số phòng",
            dataIndex: "totalRoom"
        },
        {
            title: "Số tầng",
            dataIndex: "totalFloor",
        },
        {
            title: "Hành động",
            render: (val, record) => {
                return <Link to={"/pages/manager/dorm-detail?id=" + record.id}>Chi tiết</Link>
            }
        }
    ]

    useEffect(() => {
        get("/dorms");
    }, []);

    const dataSource = data ? data.map(row => {
        row.key = row.id;
        return row;
    }) : [];

    return <AppLayout>
        <Card title={"Quản lý Dorm"} className={"h-full overflow-y-auto"}>
            <div className={"flex mb-3"}>
                <div className={"ml-auto"}>
                    <Button><Plus size={14} />Tạo mới</Button>
                </div>
            </div>
            <Table
                bordered
                loading={!data}
                dataSource={dataSource}
                columns={columns} />
        </Card>
    </AppLayout>
}