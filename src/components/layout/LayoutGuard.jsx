import {Layout} from "antd";
import {AppHeader} from "./AppHeader.jsx";
import {useState} from "react";
import {GuardSidebar} from "./GuardSidebar.jsx";

const {Content} = Layout;

export function LayoutGuard({active, children}) {
	const [collapsed, setCollapsed] = useState(false);
	return <Layout className={"!h-screen"}>
		<GuardSidebar active={active} collapsed={collapsed}/>
		<Layout>
			<AppHeader toggleSideBar={() => setCollapsed(!collapsed)}/>
			<Content className={"!overflow-auto h-full p-5 flex flex-col *:flex-grow"}>
				{children}
			</Content>
		</Layout>
	</Layout>
}
