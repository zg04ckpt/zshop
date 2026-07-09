import React from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { Footer } from "./Footer";
import { ChatWidget, RagChatWidget } from "../components";

const MainLayout = () => {
    const outletContext = useOutletContext();
    const location = useLocation();

    return (
        <>
            <div className="container-lg pt-2 min-vh-100">
                { location.pathname != '/' && <>
                    <Breadcrumb/>
                </> }
                <Outlet context={outletContext}/>
            </div>
            <RagChatWidget/>
            <ChatWidget/>
            <Footer/>
        </>
    );
}

export default MainLayout;