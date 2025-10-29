import {Button, Dropdown, Layout, Space, Table, Typography,} from "antd";
import {SideBarManager} from "../../../../components/layout/SideBarManger.jsx";
import {AppHeader} from "../../../../components/layout/AppHeader.jsx";
import {EllipsisOutlined} from "@ant-design/icons";
import {useState} from "react";


const { Header } = Layout;
const { Title } = Typography;

export function ResidentManagerPage() {
const [loading, setLoading] = useState(false);
const [residents, setResidents] = useState([]);

    const getMenuItems = (record) => [
        {
            key: '1',
            label: 'Xem chi tiết',
        },
        {
            key: '2',
            label: 'Chỉnh sửa',
        }
    ];

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: "Phòng",
            dataIndex: "roomNumber",
            key: "roomNumber",
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
        }
        ];
    return (
        <Layout className={"!h-screen"}>
            <SideBarManager active={"manager-students"} collapsed={false}/>
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
                        Quản lý người ở
                    </Title>
                </Header>
                <Layout.Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <Space>

                    </Space>
                <Table
                    columns={columns}
                    dataSource={[]}
                    loading={loading}
                    pagination={false}
                />
                </Layout.Content>
            </Layout>
        </Layout>
    )
}