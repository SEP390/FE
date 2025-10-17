import {Button, Modal, notification, message} from "antd";
import React, {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {RoomConfirm} from "./RoomConfirm.jsx";

export function RoomConfirmModal({ isOpen, setIsOpen, room }) {
    /**
     * @type {{data: {paymentUrl: string}, error: string}}
     */
    const { post, data, isError, error, isLoading } = useApi();
    const [messageApi, messageContext] = message.useMessage();
    const [slot, setSlot] = useState(null);

    const [notificationApi, notificationContext] = notification.useNotification();

    const onPayment = () => {
        if (isLoading) return;
        if (!slot) {
            messageApi.error("Bạn chưa chọn slot!").then();
            return;
        }
        post("/booking/create", {
            slotId: slot.id
        });
    }

    useEffect(() => {
        if (isError) {
            notificationApi.error({
                message: "Error",
                description: error
            })
        }
    }, [isError, error, notificationApi]);

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