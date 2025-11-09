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

// === THAY ĐỔI IMPORT TẠI ĐÂY ===
// import {GuardSchedule} from "../pages/guard/Scheduale/GuardSchedule.jsx"; // Đây là file cũ
import { StaffAttendancePage } from "../pages/guard/Attendance/StaffAttendancePage.jsx"; // Đây là file chấm công mới
// === KẾT THÚC THAY ĐỔI ===

import {GuardViewRequest} from "../pages/guard/Request/GuardViewRequest.jsx";
import {GuardViewRequestDetail} from "../pages/guard/Request/GuardViewRequestDetail.jsx";
import {DashboardManager} from "../pages/manager/DashboardManager.jsx";
import {NewsManagePage} from "../pages/manager//News/NewsManagePage.jsx";
import {CreateNewsPage} from "../pages/manager/News/CreateNewspage.jsx";
import {RoomInfoManager} from "../pages/manager/Dorm/RoomInfoManager.jsx";
import {StudentInformationPage} from "../pages/resident/information/StudentInformationPage.jsx";
import {MyRequest} from "../pages/resident/request/MyRequest.jsx";
import {CreateRequest} from "../pages/resident/request/CreateRequest.jsx";
import {ResidentRequestDetail} from "../pages/resident/request/residentrequestdetail.jsx";
import {ReportManagePage} from "../pages/manager/Report/ReportManagePage.jsx";
// THÊM IMPORT TRANG CHI TIẾT
import { RoomInforDetail } from "../pages/manager/Dorm/RoomInforDetail.jsx";
import { ManagerRequests } from "../pages/manager/Request/ManagerRequests.jsx";
import { RequestDetailPage } from "../pages/manager/Request/RequestDetailPage.jsx";
import {ResidentManagerPage} from "../pages/manager/Resident/ResidentManagerPage.jsx";
import {StaffManager} from "../pages/manager/Staff/StaffManager.jsx";
import {SurveyManagementPage} from "../pages/manager/Survey/SurveyManagementPage.jsx";
import {ScheduleManager} from "../pages/manager/Schedule/ScheduleManager.jsx";
import {ShiftConfigurationPage} from "../pages/manager/Schedule/ShiftConfigurationPage.jsx";
import {AttendanceManagementPage} from "../pages/manager/Schedule/AttendanceManagementPage.jsx";
import {CleanerSchedule} from "../pages/cleaner/CleanerSchedule.jsx";
import {CleanerSupplies} from "../pages/cleaner/CleanerSupplies.jsx";
import {TechnicalRequests} from "../pages/technical/Requetst/TechnicalRequests.jsx";
import {TechnicalRequestDetail} from "../pages/technical/Requetst/TechnicalRequestDetail.jsx";
import {TeachnicalCreateReport} from "../pages/technical/report/TeachnicalCreateReport.jsx";
import {WarehouseManagement} from "../pages/technical/warehouse/WarehouseManagement.jsx";
import {ResidentDetail} from "../pages/manager/Resident/ResidentDetail.jsx";
import {GuardCreateReport} from "../pages/guard/Report/GuardCreateReport.jsx";
import {HolidayManagePage} from "../pages/manager/Holiday/HolidayManagePage.jsx";
import {CleanerCreateReport} from "../pages/cleaner/report/CleanerCreateReport.jsx";

const routes = [
    { path: "/", element: HomePage },
    { path: "/login", element: Login },
    { path: "/survey", element: Survey },
    { path: "/news", element: NewsList },
    { path: "/booking", element: BookingPage },
    { path: "/booking-history", element: BookingHistoryPage },
    { path: "/vnpay", element: PaymentResult },
    { path: "/payment", element: PaymentHistoryPage },



    // router dành cho guard //
    { path: "/electric-water", element: ElectricWaterBillPage },
    // { path: "/guard/electric-water", element: GuardElectricWaterPage },

    // === THAY ĐỔI ĐƯỜNG DẪN TẠI ĐÂY ===
    // { path: "/guard/schedule", element: GuardSchedule }, // Đường dẫn cũ
    { path: "/guard/schedule", element: StaffAttendancePage }, // Đường dẫn mới trỏ đến trang chấm công
    // === KẾT THÚC THAY ĐỔI ===

    { path: "/guard/requests", element: GuardViewRequest },
    { path: "/guard/request-detail/:requestId", element: GuardViewRequestDetail },
    { path: "/guard/reports", element: GuardCreateReport },

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
    { path: "/manager/resident-detail/:residentId", element: ResidentDetail },
    {path: "/manager/reports", element: ReportManagePage},
    {path: "/manager/holidays", element: HolidayManagePage},

    // --- ROUTES DÀNH CHO CLEANER ---
    { path: "/cleaner/schedule", element: CleanerSchedule },
    { path: "/cleaner/supplies", element: CleanerSupplies },
    { path: "/cleaner/reports", element: CleanerCreateReport },

    // --- ROUTES DÀNH CHO TECHNICAL ---
    { path: "/technical/requests", element: TechnicalRequests },
    { path: "/technical/request-detail/:requestId", element: TechnicalRequestDetail },
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