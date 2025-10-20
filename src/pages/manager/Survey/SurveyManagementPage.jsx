import {Layout, Typography} from "antd";
import {SideBarManager} from "../../../components/layout/SideBarManger.jsx";
import {useState} from "react";
const { Header, Content } = Layout;
const { Title } = Typography;


export function SurveyManagementPage() {
    const [collapsed] = useState(false);
    return(
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

                </Content>
            </Layout>

        </Layout>
    );
}