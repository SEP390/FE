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
import {NewsManagePage} from "../pages/manager//News/NewsManagePage.jsx";
import {CreateNewsPage} from "../pages/manager/News/CreateNewspage.jsx";
import {RoomInfoManager} from "../pages/manager/RoomInfoManager.jsx";
import { StudentInformationPage } from "../pages/resident/information/StudentInformationPage.jsx";
import { MyRequest } from "../pages/resident/request/MyRequest.jsx";
import { CreateRequest } from "../pages/resident/request/CreateRequest.jsx";
// THÊM IMPORT TRANG CHI TIẾT
import { RoomInforDetail } from "../pages/manager/RoomInforDetail.jsx";
import { ManagerRequests } from "../pages/manager/Request/ManagerRequests.jsx";
import { RequestDetailPage } from "../pages/manager/Request/RequestDetailPage.jsx";
import {ResidentManagerPage} from "../pages/pages/manager/resident_manager/ResidentManagerPage.jsx";
import {StaffManager} from "../pages/manager/StaffManager.jsx";
import {SurveyManagementPage} from "../pages/manager/Survey/SurveyManagementPage.jsx";
import { ScheduleManager } from "../pages/manager/ScheduleManager.jsx";
import { ShiftConfigurationPage } from "../pages/manager/ShiftConfigurationPage.jsx";

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

    // --- ROUTES DÀNH CHO CƯ DÂN (RESIDENT) ---
    { path: "/student-info", element: StudentInformationPage },
    { path: "/my-requests", element: MyRequest },
    { path: "/create-request", element: CreateRequest },

    // --- ROUTES DÀNH CHO MANAGER ---
    { path: "/manager", element: DashboardManager },
    { path: "/manager/news", element: NewsManagePage },
    { path: "/manager/news/create", element: CreateNewsPage  },
    { path: "/manager/rooms", element: RoomInfoManager },
    { path: "/manager/rooms/:roomNumber", element: RoomInforDetail },
    { path: "/manager/requests", element: ManagerRequests },
    { path: "/manager/request-detail/:requestId", element: RequestDetailPage },
    { path: "/manager/staff", element: StaffManager },
    { path: "/manager/schedule", element: ScheduleManager },
    { path: "/manager/shifts", element: ShiftConfigurationPage },
    { path: "/manager/surveys", element: SurveyManagementPage },
    {path: "/manager/residents", element: ResidentManagerPage},
];

// dynamic route register
// url: /pages/**/<file.jsx>, example: http://localhost:5173/pages/manager/dorm
const pages = import.meta.glob("/src/pages/pages/**/*.jsx", { eager: true });
Object.keys(pages).map((route) => ({
    path: route.replace(/\/src\/pages|\.jsx$/g, ''),
    element: pages[route].default,
})).forEach((route) => {
    routes.push(route);
});

export default routes;
