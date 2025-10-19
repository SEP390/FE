import React from 'react';
import {GuestPage} from "./GuestPage.jsx";
import {DashboardPage} from "./resident/DashboardPage.jsx";
import {useToken} from "../hooks/useToken.js";

const HomePage = () => {
    const { token } = useToken();
    if (token != null) {
        return <>
            <DashboardPage />
        </>
    }
    return <>
        <GuestPage />
    </>
}

export default HomePage;