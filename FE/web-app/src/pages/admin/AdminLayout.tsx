import React from "react";
import './AdminLayout.css'
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isSelected = (path: string) => {
        return location.pathname === path? 'selected':''
    }

    return (
        <div className="admin">
            <div className="card card-body rounded-0 mt-4 pt-2">
                {/* Navigation tab */}
                <div className="d-flex tab mb-2">
                <div className={`tab-item px-3 py-1 ${isSelected('/admin')}`} 
                        onClick={() => navigate('/admin')}>Tổng quan</div>

                    <div className={`tab-item px-3 py-1 ${isSelected('/admin/product')}`} 
                        onClick={() => navigate('/admin/product')}>Sản phẩm (32)</div>

                    <div className={`tab-item px-3 py-1 ${isSelected('/admin/user')}`} 
                        onClick={() => navigate('/admin/user')}>Người dùng (10)</div>

                    <div className={`tab-item px-3 py-1 ${isSelected('/admin/cate')}`} 
                        onClick={() => navigate('/admin/cate')}>Thể loại (10)</div>
                </div>

                {/* Content */}
                <Outlet/>
            </div>
        </div>
    );
}

export default AdminLayout;