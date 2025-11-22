import {Button} from "antd";
import {useNavigate} from "react-router-dom";
import {ChevronLeft} from "lucide-react";

export function GoBack({url}) {
    const navigate = useNavigate();
    return <Button onClick={() => navigate(url)} icon={<ChevronLeft size={14}/>} type={"text"}>Quay lại</Button>
}