import {Layout} from "antd";
import {AppHeader} from "./AppHeader.jsx";
import {SideBarGuard} from "./SideBarGuard.jsx";
import {useState} from "react";

const {Content} = Layout;

export function LayoutGuard({active, children}) {
	const [collapsed, setCollapsed] = useState(false);
	return <Layout className={"!h-screen"}>
		<SideBarGuard active={active} collapsed={collapsed}/>
		<Layout>
			<AppHeader toggleSideBar={() => setCollapsed(!collapsed)}/>
			<Content className={"!overflow-auto h-full p-5 flex flex-col"}>
				{children}
			</Content>
		</Layout>
	</Layout>
}
