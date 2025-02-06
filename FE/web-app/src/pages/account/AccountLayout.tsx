import React, { useEffect } from "react";
import './AccountLayout.css'
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AccountLayout = () => {
    const nav = useNavigate();
    const loc = useLocation();
    useEffect(() => {}, [loc.pathname])

    return (
        <div className="row account-layout mt-3">
            {/* Left - Option */}
            <div className="col-3">
                <div className="d-flex flex-column">

                    <div 
                        className={`option ${loc.pathname == '/account'? 'selected': ''}`} 
                        onClick={() => nav('')}>
                            Thông tin cá nhân
                    </div>

                    <div 
                        className={`option ${loc.pathname == '/account/address'? 'selected': ''}`} 
                        onClick={() => nav('address')}>
                            Địa chỉ mua hàng
                    </div>

                    <div 
                        className={`option ${loc.pathname == '/account/history'? 'selected': ''}`} 
                        onClick={() => nav('history')}>
                            Lịch sử mua hàng
                    </div>
                </div>
            </div>

            {/* Right - Content */}
            <div className="col-9 ps-0">
                <Outlet/>
            </div>
        </div>
    );
}

export default AccountLayout;