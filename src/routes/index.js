import Survey from "../components/Survery/Survey";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login/Login";
import {BookingPage} from "../pages/booking/BookingPage.jsx";
import {PaymentResult} from "../pages/booking/PaymentResult.jsx";
import {BookingHistoryPage} from "../pages/booking/BookingHistoryPage.jsx";
import {PaymentHistoryPage} from "../pages/booking/PaymentHistoryPage.jsx";
import {NewsList} from "../pages/News/NewsList.jsx";
import {ElectricWaterBillPage} from "../pages/electric-water/ElectricWaterBillPage.jsx";
import {GuardElectricWaterPage} from "../pages/guard/electric-water/GuardElectricWaterPage.jsx";
import {DashboardManager} from "../pages/manager/DashboardManager.jsx";
import {RoomInfoManager} from "../pages/manager/RoomInfoManager.jsx";
// THÊM IMPORT TRANG CHI TIẾT
import { RoomInforDetail } from "../pages/manager/RoomInforDetail.jsx";
import {StaffManager} from "../pages/manager/StaffManager.jsx";


const routes = [
    { path: "/", element: HomePage },
    { path: "/login", element: Login },
    { path: "/survey", element: Survey },
    { path: "/news", element: NewsList },
    { path: "/booking", element: BookingPage },
    { path: "/booking-history", element: BookingHistoryPage },
    { path: "/vnpay", element: PaymentResult },
    { path: "/payment", element: PaymentHistoryPage },
    { path: "/electric-water", element: ElectricWaterBillPage },
    { path: "/guard/electric-water", element: GuardElectricWaterPage },

    // --- ROUTES DÀNH CHO MANAGER ---
    { path: "/manager/home", element: DashboardManager },
    { path: "/manager/rooms", element: RoomInfoManager },
    { path: "/manager/rooms/:roomNumber", element: RoomInforDetail },
    { path: "/manager/staff", element: StaffManager },
];

export default routes;
