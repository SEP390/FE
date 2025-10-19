import Survey from "../components/Survery/Survey";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login/Login";
import { BookingPage } from "../pages/booking/BookingPage.jsx";
import { PaymentResult } from "../pages/booking/PaymentResult.jsx";
import { BookingHistoryPage } from "../pages/booking/BookingHistoryPage.jsx";
import { PaymentHistoryPage } from "../pages/booking/PaymentHistoryPage.jsx";
import { NewsList } from "../pages/News/NewsList.jsx";
import { ElectricWaterBillPage } from "../pages/electric-water/ElectricWaterBillPage.jsx";
import { GuardElectricWaterPage } from "../pages/guard/electric-water/GuardElectricWaterPage.jsx";
import { DashboardManager } from "../pages/manager/DashboardManager.jsx";
import { StudentInformationPage } from "../pages/resident/information/StudentInformationPage.jsx";
import { MyRequest } from "../pages/resident/request/MyRequest.jsx"; // 👈 thêm dòng này
import { CreateRequest } from "../pages/resident/request/CreateRequest.jsx";

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
    { path: "/manager/home", element: DashboardManager },
    { path: "/student-info", element: StudentInformationPage },
    { path: "/my-requests", element: MyRequest }, // 👈 thêm dòng này
    { path: "/create-request", element: CreateRequest },

];
export default routes;
