import {Layout} from "antd";
import {SideBarManager} from "../../../../components/layout/SideBarManger.jsx";
import {AppHeader} from "../../../../components/layout/AppHeader.jsx";

export function ResidentManagerPage() {
    return (
        <Layout className={"!h-screen"}>
            <SideBarManager active={"manager-students"} collapsed={false}/>
            <Layout>
                <AppHeader/>
                <Layout.Content className={"!overflow-auto h-full p-5 flex flex-col"}>

                </Layout.Content>
            </Layout>
        </Layout>
    )
}