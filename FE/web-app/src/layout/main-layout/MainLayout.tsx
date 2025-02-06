import React from "react";
import { Footer } from "../footer/Footer";
import { Header } from "../header/Header";
import { Outlet, ScrollRestoration } from "react-router-dom";
import TopBar from "../topbar/TopBar";
import './MainLayout.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
    return (
        <>
            

            {/* Content */}
            <div className="MainLayout">
                <TopBar/>
                {/* <Header/> */}
                <div className="container-lg page">
                    <Outlet/>
                </div>
                <Footer/>
            </div>        
            <ScrollRestoration/>
        </>
    );
        
}

export default MainLayout;