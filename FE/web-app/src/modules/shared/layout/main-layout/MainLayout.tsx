import React from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Breadcrumb from "../../components/breadcumb/Breadcrumb";

const MainLayout = () => {
    const outletContext = useOutletContext();
    const location = useLocation();

    return (
        <div className="container-lg pt-2">
            { location.pathname != '/' && <>
                <Breadcrumb/>
            </> }
            <Outlet context={outletContext}/>
        </div>
    );
}

export default MainLayout;