import React from "react";
import './AdminLayout.css'
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const outletContext = useOutletContext();

    return (
        <div className="admin-layout mt-2 px-3">
            <div className="row">
                <div className="col-2">
                    <label className="py-1 fw-bold text-secondary"><i className='bx bx-chevrons-right'></i>Quản lý</label>
                    <div className="d-flex flex-column">
                        {/* <div 
                            className={`option ${location.pathname.startsWith('/admin/overview')? 'selected': ''}`} 
                            onClick={() => navigate('/admin/overview')}>
                                Tổng quan
                        </div> */}

                        <div 
                            className={`option ${location.pathname.startsWith('/admin/product')? 'selected': ''}`} 
                            onClick={() => navigate('/admin/product')}>
                                Kho sách
                        </div>

                        <div 
                            className={`option ${location.pathname.startsWith('/admin/user')? 'selected': ''}`} 
                            onClick={() => navigate('/admin/user')}>
                                Tài khoản người dùng
                        </div>

                        <div 
                            className={`option ${location.pathname.startsWith('admin/cate')? 'selected': ''}`} 
                            onClick={() => navigate('/admin/cate')}>
                                Danh mục sách
                        </div>

                        <div 
                            className={`option ${location.pathname.startsWith('/admin/order')? 'selected': ''}`} 
                            onClick={() => navigate('/admin/order')}>
                                Đơn hàng
                        </div>
                    </div>
                </div>

                {/* Right - Content */}
                <div className="col-10">
                    <Outlet context={outletContext}/>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;