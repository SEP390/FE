import {Button, Modal} from "antd";
import React, {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import useMessage from "antd/es/message/useMessage.js";
import {RoomConfirm} from "./RoomConfirm.jsx";
import useNotification from "antd/es/notification/useNotification.js";

"?"

export function RoomConfirmModal({ isOpen, setIsOpen, room }) {
    const { post, data, isError, error, isLoading } = useApi();
    const [message, messageContext] = useMessage();
    const [slot, setSlot] = useState(null);

    const [notification, notificationContext] = useNotification();

    const onPayment = () => {
        if (isLoading) return;
        if (!slot) {
            message.error("Bạn chưa chọn slot!");
            return;
        }
        post("/booking/create", {
            slotId: slot.id
        }, {});
    }

    useEffect(() => {
        if (isError) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error
            })
        }
    }, [isError, error]);

    useEffect(() => {
        if (!data) return;
        window.location.href = data.paymentUrl;
    }, [data]);

    const onClose = () => {
        setIsOpen(false);
        setSlot(null);
    }

    if (!room) return <></>;

    return <>
        {messageContext}{notificationContext}
        <Modal
            width={"1000px"}
            title="Xác nhận"
            closable={{'aria-label': 'Custom Close Button'}}
            open={isOpen}
            onOk={onClose}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>Hủy</Button>,
                <Button loading={isLoading} type={"primary"} key="payment" onClick={onPayment}>Thanh toán</Button>
            ]}>
            <RoomConfirm room={room} slot={slot} setSlot={setSlot} />
        </Modal>
    </>;
}