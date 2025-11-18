import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {App, Button, Card, Modal} from "antd";
import {create} from 'zustand'
import {useEffect, useRef} from "react";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {formatPrice} from "../../../util/formatPrice.js";
import {Bed} from "lucide-react";
import {useProfile} from "../../../hooks/useProfile.js";

const useStore = create(set => ({
    recentRoom: null,
    selectedRoom: null,
    selectedSlot: null,
    nextSemester: null,
    ewPrice: {
        electricPrice: null,
        waterPrice: null,
    },
    fetchEWPrice: async () => {
        const res = await axiosClient("/electric-water-pricing")
        set({ewPrice: res.data})
    },
    fetchNextSemester: async () => {
        const res = await axiosClient("/semesters/next");
        set({nextSemester: res.data})
    },
    setSelectedRoom: (selectedRoom) => set({selectedRoom}),
    setSelectedSlot: (selectedSlot) => set({selectedSlot}),
    fetchRecentRoom: async () => {

    },
    matchingRooms: [],
    fetchMatchingRooms: async () => {
        const res = await axiosClient("/rooms-matching", {})
        console.log(res.data)
        set({matchingRooms: res.data})
    }
}))

function formatMatching(val) {
    return val.toFixed(2) + "%";
}

function ConfirmModal() {

    const {profile} = useProfile();

    const {selectedRoom, setSelectedRoom, setSelectedSlot, selectedSlot, nextSemester} = useStore();

    const ref = useRef(null);

    useEffect(() => {
        if (selectedSlot) {
            ref.current.scrollIntoView();
        }
    }, [selectedSlot]);

    return <>
        {selectedRoom !== null && selectedSlot !== null && <>
            <div ref={ref}>
                <div className={"border border-gray-200 mb-3"}>
                    <div className={"p-2 bg-gray-100"}>Thông tin sinh viên</div>
                    <div className={"p-2 grid grid-cols-3"}>
                        <div>Mã sinh viên:</div>
                        <div className={"col-span-2"}>{profile.studentId}</div>
                    </div>
                </div>
                <div className={"border border-gray-200  grid grid-cols-3"}>
                    <div className={"col-span-2 border-r border-gray-200"}>
                        <div className={"p-2 bg-gray-100"}>Thông tin dịch vụ</div>
                        <div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Phòng:</div>
                                <div className={"col-span-2"}>{selectedRoom.roomNumber}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Dorm:</div>
                                <div className={"col-span-2"}>{selectedRoom.dorm.dormName}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Slot:</div>
                                <div className={"col-span-2"}>{selectedSlot.slotName}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Loại phòng:</div>
                                <div className={"col-span-2"}>Phòng {selectedRoom.slots.length} giường</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Kỳ:</div>
                                <div className={"col-span-2"}>{nextSemester.name}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Ngày bắt đầu:</div>
                                <div className={"col-span-2"}>{nextSemester.startDate}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Ngày kết thúc:</div>
                                <div className={"col-span-2"}>{nextSemester.endDate}</div>
                            </div>
                            <div className={"p-2 grid grid-cols-3 gap-3"}>
                                <div>Giá:</div>
                                <div className={"col-span-2"}>{formatPrice(selectedRoom.pricing.price)}</div>
                            </div>
                        </div>
                    </div>
                    <div className={"flex flex-col"}>
                        <div className={"p-2 bg-gray-100"}>Thành tiền</div>
                        <div className={"mt-auto p-2"}>
                            <div className={""}>Giá điện: {}</div>
                            <div className={""}>Giá nước: {}</div>
                            <div
                                className={"text-xl font-medium text-right"}>{formatPrice(selectedRoom.pricing.price)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>}
    </>
}

function RoomModal() {
    const {selectedRoom, setSelectedRoom, selectedSlot, setSelectedSlot} = useStore();
    const onCancel = () => {
        setSelectedRoom(null);
    }
    const slots = selectedRoom?.slots;
    const roomNumber = selectedRoom?.roomNumber;
    const dormName = selectedRoom?.dorm?.dormName;

    return <>
        {selectedRoom !== null && <>
            <div className={"mb-3 font-medium"}>{dormName} - {roomNumber}</div>
            <div className={"flex gap-3 flex-wrap"}>
                {slots.map(s => <div key={s.id}>
                    <div onClick={() => setSelectedSlot(s)}
                         className={"rounded-lg flex p-2 border border-gray-200 hover:cursor-pointer hover:shadow-lg transition-all items-center gap-2"}>
                        <Bed/>{s.slotName}</div>
                </div>)}
            </div>
        </>}
    </>
}