import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {useApi} from "../../../hooks/useApi.js";
import {useEffect, useState} from "react";
import {Button, Card, Form, Input, Table, Tag} from "antd";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";

export default function ManageSemester() {
    const {get, data, error, isSuccess} = useApi();

    const navigate = useNavigate();

    const fetchData = () => {
        get("/semesters");
    }

    /**
     * @type {import("antd").TableColumnsType}
     */
    const cols = [
        {
            title: "Tên",
            key: "name",
            dataIndex: "name",
            render: (val) => <Tag>{val}</Tag>
        },
        {
            title: "Ngày bắt đầu",
            key: "startDate",
            dataIndex: "startDate",
        },
        {
            title: "Ngày kết thúc",
            key: "endDate",
            dataIndex: "endDate",
        },
        {
            title: "Hành động",
            render: (val, row) => {
                return <>
                    <Button onClick={() => navigate("/pages/manager/semester/edit?id=" + row.id)} type={"link"}>Sửa</Button>
                </>
            }
        }
    ]

    useEffect(() => {
        fetchData();
    }, []);

    const dataSource = data ? data.map(row => {
        row.key = row.id;
        return row;
    }) : [];

    return <AppLayout>
        <Card title={"Quản lý kỳ"}>
            <div className={"mb-3"}>
                <Button onClick={() => navigate("/pages/manager/semester/create")} className={"flex items-center"}><Plus size={14}/>Thêm</Button>
            </div>
            <Table bordered dataSource={dataSource} columns={cols}></Table>
        </Card>
    </AppLayout>
}