import { Layout, Typography, Table, Dropdown, Button, message, Space, Input, Modal } from "antd";
import {EllipsisOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {SideBarManager} from "../../../components/layout/SideBarManger.jsx";
import {useEffect, useState} from "react";
import {QuestionModal} from "../../../components/Survery/QuestionModal.jsx";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";
import {useCollapsed} from "../../../hooks/useCollapsed.js";


const {Header, Content} = Layout;
const {Title} = Typography;


export function SurveyManagementPage() {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestion, setFilteredQuestion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editID, setEditID] = useState(null);
    const [exportModalVisible, setExportModalVisible] = useState(false);


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

    const handleExportDetailExcel = async () => {
        const token = localStorage.getItem("token");
        if (!questions.length) {
            message.warning("Không có dữ liệu để xuất!");
            return;
        }

        setLoading(true);
        try {
            const allDetails = [];

            // Gọi API từng câu hỏi để lấy options
            for (const q of questions) {
                const res = await fetch(`http://localhost:8080/api/surveys/${q.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();

                if (json.status === 200 && json.data) {
                    const options = json.data.options.map(o => o.optionContent).join(", ");
                    allDetails.push({
                        "STT": allDetails.length + 1,
                        "Câu hỏi": json.data.questionContent,
                        "Các lựa chọn": options || "Không có lựa chọn",
                    });
                }
            }

            // Tạo sheet và file Excel
            const ws = XLSX.utils.json_to_sheet(allDetails);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Chi tiết khảo sát");

            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "Chi_tiet_khao_sat.xlsx");
            message.success("Xuất file Excel thành công!");
        } catch (error) {
            message.error("Lỗi khi xuất file Excel!");
            console.error(error);
        } finally {
            setLoading(false);
        }
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
        setEditID(record.id);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        message.warning(`Xóa câu hỏi có id: ${record.id}`);
        // TODO: gọi API DELETE
    };

    const handleCreate = () => {
        setEditID(null);
        setModalVisible(true);
    }

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
                        menu={{items: getMenuItems(record)}}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                </Space>
            ),
            width: "15%",
        },
    ];
    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    }
    return (
        <Layout style={{minHeight: "100vh"}}>
            <SideBarManager collapsed={collapsed} active="manager-surveys"/>
            <Layout>
                <AppHeader header={"Quản lí khảo sát"} toggleSideBar={toggleSideBar}/>

                <Content style={{margin: "24px", background: "#fff", padding: 24}}>

                    <Space
                        style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Input
                            placeholder="Tìm kiếm câu hỏi..."
                            allowClear
                            prefix={<SearchOutlined/>}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{maxWidth: 400}}
                        />
                        <Space style={{ marginBottom: 16 }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                Tạo câu hỏi mới
                            </Button>

                            <Button onClick={() => setExportModalVisible(true)}>Xuất chi tiết Excel</Button>
                        </Space>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredQuestion}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </Content>
                <QuestionModal
                    open={modalVisible}
                    questionId={editID}
                    onCancel={() => setModalVisible(false)}
                    onSuccess={() => window.location.reload()}
                />
                <Modal
                    title="Xác nhận xuất file"
                    open={exportModalVisible}
                    onOk={() => {
                        setExportModalVisible(false);
                        handleExportDetailExcel();
                    }}
                    onCancel={() => setExportModalVisible(false)}
                >
                    Bạn có chắc muốn xuất toàn bộ chi tiết khảo sát ra Excel không?
                </Modal>
            </Layout>
        </Layout>
    );
}

