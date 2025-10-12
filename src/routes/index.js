import Survey from "../components/Survery/Survey";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login/Login";
import {BookingPage} from "../pages/booking/BookingPage.jsx";
import {PaymentResult} from "../pages/booking/PaymentResult.jsx";
import {BookingHistoryPage} from "../pages/booking/BookingHistoryPage.jsx";
import {PaymentHistoryPage} from "../pages/booking/PaymentHistoryPage.jsx";
import {GuardElectricWaterPage} from "../pages/electric-water/GuardElectricWaterPage.jsx";

const routes = [
    { path: "/", element: HomePage },
    { path: "/login", element: Login },
    { path: "/survey", element: Survey },
    { path: "/booking", element: BookingPage },
    { path: "/booking-history", element: BookingHistoryPage },
    { path: "/vnpay", element: PaymentResult },
    { path: "/payment", element: PaymentHistoryPage },
    { path: "/guard/electric-water", element: GuardElectricWaterPage },
];

export default routes;
