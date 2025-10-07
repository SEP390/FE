import React from 'react';
import {GuestPage} from "./GuestPage.jsx";
import {DashboardPage} from "./DashboardPage.jsx";

const HomePage = () => {
    if (localStorage.getItem("token") != null) {
        return <>
            <DashboardPage />
        </>
    }
    return <>
        <GuestPage />
    </>
}

export default HomePage;