import Survey from "../pages/Survery/Survey";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login/Login";

const routes = [
    { path: "/", element: HomePage },
    { path: "/login", element: Login },
    { path: "/survey", element: Survey }
];

export default routes;
