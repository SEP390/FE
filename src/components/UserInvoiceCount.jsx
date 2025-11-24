import {createApiStore} from "../util/createApiStore.js";
import {InvoiceCountLabel} from "./InvoiceCountLabel.jsx";
import {useViewEffect} from "../hooks/useViewEffect.js";

const userInvoiceCountStore = createApiStore("GET", "/user/invoices/count")
export function UserInvoiceCount() {
    const {data} = userInvoiceCountStore()

    useViewEffect(userInvoiceCountStore)

    return <div className={"section"}>
        <div className={"grid grid-cols-3 gap-3"}>
            <InvoiceCountLabel label={"Tổng số hóa đơn"} count={data?.totalCount}/>
            <InvoiceCountLabel label={"Tổng số chưa thanh toán"} count={data?.totalPending}/>
            <InvoiceCountLabel label={"Tổng số đã thanh toán"} count={data?.totalSuccess}/>
        </div>
    </div>
}