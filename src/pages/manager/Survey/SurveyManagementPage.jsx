import {Layout, Typography, Table, Dropdown, Button, message, Space, Input} from "antd";
import {EllipsisOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import {CreateQuestionModal} from "../../../components/Survery/CreateQuestionModal.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;

export function SurveyManagementPage() {
    const [collapsed] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestion, setFilteredQuestion] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [modalVisible, setModalVisible] = useState(false);


    function removeVietnameseTones(str = "") {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }

    function normalizeSpaces(str = "") {
        return str.replace(/\s+/g, " ").trim();
    }

    const handleSearch = (value) => {
        const normalizedValue = normalizeSpaces(removeVietnameseTones(value));

        if (!normalizedValue) {
            setFilteredQuestion(questions);
            return;
        }

        const filtered = questions.filter((q) =>
            removeVietnameseTones(q.questionContent).includes(normalizedValue)
        );
        setFilteredQuestion(filtered);
    };


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
                    setQuestions(data.data)
                    setFilteredQuestion(data.data);
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

                    <Space
                        style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Input
                            placeholder="Tìm kiếm tin tức..."
                            allowClear
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ maxWidth: 400 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Tạo câu hỏi mới
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredQuestion}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </Content>
                <CreateQuestionModal
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onSuccess={() => window.location.reload()}
                />
            </Layout>
        </Layout>
    );
}

