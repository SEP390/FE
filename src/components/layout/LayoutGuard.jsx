import { Layout, Typography } from "antd"; // Thêm Typography để hiển thị tiêu đề
import { AppHeader } from "./AppHeader.jsx";
import { useState } from "react";
import { GuardSidebar } from "./GuardSidebar.jsx";

const { Content } = Layout;
const { Text } = Typography; // Lấy Text để hiển thị đường dẫn

/**
 * LayoutGuard Component:
 * Layout chung cho vai trò Bảo vệ, bao gồm Sidebar, Header và Content.
 * * @param {string} active - Key của menu đang hoạt động trong sidebar.
 * @param {React.ReactNode} children - Nội dung chính của trang.
 * @param {string} header - Tiêu đề/Đường dẫn trang hiện tại (ví dụ: "Bảo vệ / Thông tin phòng").
 */
export function LayoutGuard({ active, children, header }) {
    const [collapsed, setCollapsed] = useState(false); // Giữ nguyên useState

    // Hàm chuyển đổi trạng thái sidebar
    const toggleSideBar = () => {
        setCollapsed(prev => !prev);
    };

    return (
        <Layout className={"!h-screen"}>
            {/* Sidebar Guard */}
            <GuardSidebar active={active} collapsed={collapsed} />

            <Layout>
                {/* Header: Truyền header và collapsed prop để nó tự căn chỉnh vị trí */}
                <AppHeader
                    header={header}
                    toggleSideBar={toggleSideBar}
                    collapsed={collapsed} // Quan trọng cho việc tính toán vị trí Header cố định
                />

                {/* Content: Áp dụng margin để tránh bị Header và Sidebar cố định che */}
                <Content
                    className={"!overflow-auto h-full p-5 flex flex-col *:flex-grow"}
                    style={{
                        marginTop: 64, // Bù đắp chiều cao Header cố định (H=64px)
                        // Bù đắp chiều rộng Sidebar (80px khi collapsed, 260px khi open)
                        marginLeft: collapsed ? 80 : 260,
                        transition: 'margin-left 0.3s ease',
                        padding: '24px', // Điều chỉnh padding
                        background: '#f0f2f5', // Màu nền
                    }}
                >
                    {/* Phần hiển thị trang hiện tại (Yêu cầu của bạn) */}
                    {header && (
                        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                            <Text type="secondary" className="text-sm">Trang hiện tại: </Text>
                            <Text strong className="text-base">{header}</Text>
                        </div>
                    )}

                    {/* Nội dung chính của trang */}
                    <div className="flex-grow">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}