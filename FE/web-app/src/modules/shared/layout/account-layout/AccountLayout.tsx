import React, { useEffect } from "react";
import './AccountLayout.css'
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumb from "../../components/breadcumb/Breadcrumb";

export const AccountLayout = () => {
    const nav = useNavigate();
    const loc = useLocation();
    const outletContext = useOutletContext();
    useEffect(() => {}, [loc.pathname])

    return (
        <div className="account-layout mt-3 px-3">
            <div className="row">
                <div className="col-2">
                    <label className="py-1 fw-bold text-secondary"><i className='bx bx-chevrons-right'></i>Thông tin tài khoản</label>
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
                            className={`option ${loc.pathname == '/account/purchase-history'? 'selected': ''}`} 
                            onClick={() => nav('purchase-history')}>
                                Sách đã mua
                        </div>

                        <div 
                            className={`option ${loc.pathname == '/account/payment-history'? 'selected': ''}`} 
                            onClick={() => nav('payment-history')}>
                                Lịch sử thanh toán
                        </div>
                    </div>
                </div>

                {/* Right - Content */}
                <div className="col-10 pt-0">
                    <Breadcrumb/>
                    <Outlet context={outletContext}/>
                </div>
            </div>
        </div>
    );
}
