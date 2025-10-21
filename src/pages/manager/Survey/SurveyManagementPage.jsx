import { Layout, Typography, Table, Dropdown, Button, message, Space } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { useEffect, useState } from "react";

const { Header, Content } = Layout;
const { Title } = Typography;

export function SurveyManagementPage() {
    const [collapsed] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:8080/api/surveys", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 200) {
                    setQuestions(data.data);
                } else {
                    message.error("Không thể tải dữ liệu khảo sát");
                }
                setLoading(false);
            })
            .catch(() => {
                message.error("Lỗi kết nối server");
                setLoading(false);
            });
    }, []);

    const handleEdit = (record) => {
        message.info(`Chỉnh sửa câu hỏi: ${record.questionContent}`);
        // TODO: thêm modal edit
    };

    const handleDelete = (record) => {
        message.warning(`Xóa câu hỏi có id: ${record.id}`);
        // TODO: gọi API DELETE
    };

    const getMenuItems = (record) => [
        {
            key: "edit",
            label: "Chỉnh sửa",
            onClick: () => handleEdit(record),
        },
        {
            key: "delete",
            label: "Xóa",
            onClick: () => handleDelete(record),
        },
    ];

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            render: (_, __, index) => index + 1,
            width: "10%",
        },
        {
            title: "Nội dung câu hỏi",
            dataIndex: "questionContent",
            key: "questionContent",
            width: "75%",
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Dropdown
                        menu={{ items: getMenuItems(record) }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            ),
            width: "15%",
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-surveys" />
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #f0f0f0",
                        height: 80,
                    }}
                >
                    <Title level={2} style={{ margin: 0, lineHeight: "80px" }}>
                        Quản lý khảo sát
                    </Title>
                </Header>

                <Content style={{ margin: "24px", background: "#fff", padding: 24 }}>
                    <Table
                        columns={columns}
                        dataSource={questions}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}

