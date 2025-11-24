import {Button} from "antd";
import {useNavigate} from "react-router-dom";
import {ChevronLeft} from "lucide-react";

export function PageHeader({ title, back }) {
    const navigate = useNavigate();
    return <>
        <div className={"section"}>
            <div className={"flex gap-3 items-center"}>
                {back && <Button type={"text"} icon={<ChevronLeft size={14}/>} onClick={() => navigate(back)}>Quay lại</Button>}
                <div className={"font-medium text-lg"}>{title}</div>
            </div>
        </div>
    </>
}