import Survey from "../components/Survery/Survey";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login/Login";
import {BookingPage} from "../pages/booking/BookingPage.jsx";
import {PaymentResult} from "../pages/booking/PaymentResult.jsx";
import {BookingHistoryPage} from "../pages/booking/BookingHistoryPage.jsx";
import {PaymentHistoryPage} from "../pages/booking/PaymentHistoryPage.jsx";
import {NewsList} from "../pages/News/NewsList.jsx";
import {ElectricWaterBillPage} from "../pages/electric-water/ElectricWaterBillPage.jsx";
//import {GuardElectricWaterPage} from "../pages/guard/electric-water/GuardElectricWaterPage.jsx";
import {GuardSchedule} from "../pages/guard/Scheduale/GuardSchedule.jsx";
import {GuardViewRequest} from "../pages/guard/Request/GuardViewRequest.jsx";
import {GuardViewRequestDetail} from "../pages/guard/Request/GuardViewRequestDetail.jsx";
import {DashboardManager} from "../pages/manager/DashboardManager.jsx";
import {NewsManagePage} from "../pages/manager//News/NewsManagePage.jsx";
import {CreateNewsPage} from "../pages/manager/News/CreateNewspage.jsx";
import {RoomInfoManager} from "../pages/manager/RoomInfoManager.jsx";
import {StudentInformationPage} from "../pages/resident/information/StudentInformationPage.jsx";
import {MyRequest} from "../pages/resident/request/MyRequest.jsx";
import {CreateRequest} from "../pages/resident/request/CreateRequest.jsx";
import {ResidentRequestDetail} from "../pages/resident/request/residentrequestdetail.jsx";
import {ReportManagePage} from "../pages/manager/Report/ReportManagePage.jsx";
// THÊM IMPORT TRANG CHI TIẾT
import { RoomInforDetail } from "../pages/manager/RoomInforDetail.jsx";
import { ManagerRequests } from "../pages/manager/Request/ManagerRequests.jsx";
import { RequestDetailPage } from "../pages/manager/Request/RequestDetailPage.jsx";
import {ResidentManagerPage} from "../pages/pages/manager/resident_manager/ResidentManagerPage.jsx";
import {StaffManager} from "../pages/manager/StaffManager.jsx";
import {SurveyManagementPage} from "../pages/manager/Survey/SurveyManagementPage.jsx";
import {ScheduleManager} from "../pages/manager/ScheduleManager.jsx";
import {ShiftConfigurationPage} from "../pages/manager/ShiftConfigurationPage.jsx";
import {AttendanceManagementPage} from "../pages/manager/AttendanceManagementPage.jsx";
import {CleanerSchedule} from "../pages/cleaner/CleanerSchedule.jsx";
import {CleanerSupplies} from "../pages/cleaner/CleanerSupplies.jsx";
import {TechnicalRequests} from "../pages/technical/TechnicalRequests.jsx";
import {TeachnicalCreateReport} from "../pages/technical/TeachnicalCreateReport.jsx";
import {WarehouseManagement} from "../pages/technical/WarehouseManagement.jsx";

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
   // { path: "/guard/electric-water", element: GuardElectricWaterPage },
    { path: "/guard/schedule", element: GuardSchedule },
    { path: "/guard/requests", element: GuardViewRequest },
    { path: "/guard/request-detail/:requestId", element: GuardViewRequestDetail },

    // --- ROUTES DÀNH CHO CƯ DÂN (RESIDENT) ---
    { path: "/student-info", element: StudentInformationPage },
    { path: "/my-requests", element: MyRequest },
    { path: "/create-request", element: CreateRequest },
    { path: "/resident-request-detail/:requestId", element: ResidentRequestDetail },

    // --- ROUTES DÀNH CHO MANAGER ---
    { path: "/manager", element: DashboardManager },
    { path: "/manager/news", element: NewsManagePage },
    { path: "/manager/news/create", element: CreateNewsPage  },
    { path: "/manager/rooms", element: RoomInfoManager },
    { path: "/manager/room-detail/:roomId", element: RoomInforDetail },
    { path: "/manager/requests", element: ManagerRequests },
    { path: "/manager/request-detail/:requestId", element: RequestDetailPage },
    { path: "/manager/staff", element: StaffManager },
    { path: "/manager/schedule", element: ScheduleManager },
    { path: "/manager/shifts", element: ShiftConfigurationPage },
    { path: "/manager/attendance", element: AttendanceManagementPage },
    { path: "/manager/surveys", element: SurveyManagementPage },
    {path: "/manager/residents", element: ResidentManagerPage},
    {path: "/manager/reports", element: ReportManagePage},

    // --- ROUTES DÀNH CHO CLEANER ---
    { path: "/cleaner/schedule", element: CleanerSchedule },
    { path: "/cleaner/supplies", element: CleanerSupplies },

    // --- ROUTES DÀNH CHO TECHNICAL ---
    { path: "/technical/requests", element: TechnicalRequests },
    { path: "/technical/reports/create", element: TeachnicalCreateReport },
    { path: "/technical/inventory", element: WarehouseManagement },

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
