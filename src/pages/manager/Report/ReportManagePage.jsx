import {Layout} from "antd";
import {SideBarManager} from "../../../components/layout/SideBarManger.jsx";


export function ReportManagePage(){
    return <Layout className={"!h-screen"}>
        <SideBarManager active={"manager-reports"} collapsed={false}/>
    </Layout>
}