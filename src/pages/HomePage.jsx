import React from 'react';
import {GuestPage} from "./GuestPage.jsx";

const HomePage = () => {
    // if auth return UserHomePage
    // else return GuestPage
    return <>
        <GuestPage />
    </>
}

export default HomePage;