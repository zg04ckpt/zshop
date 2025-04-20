import React from "react";
import { Outlet, useOutletContext } from "react-router-dom";
// import './MainLayout.css';

const MainLayout = () => {
    const outletContext = useOutletContext();
    return (
        <div className="">
            <Outlet context={outletContext}/>
        </div>
    );
}

export default MainLayout;