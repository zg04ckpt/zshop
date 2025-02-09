import React, { useContext, useState } from "react";
import './TopBar.css'
import band from "../../../assets/images/band.png";
import logo from "../../../assets/images/test-img.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import { AppDispatch, RootState } from "../../stores/redux-toolkit.store";
import { useSelector } from "react-redux";
import { LocalUser } from "../../../features/auth/model";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showConfirm } from "../../components/confirm-dialog/confirm-dialog.slice";
import { useLogin, useLogout } from "../../../features/auth";

const TopBar = () => {
    const confirmDispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { navigateToLoginPage } = useLogin();
    const user: LocalUser|null = useSelector((state: RootState) => state.auth.user);
    const { logout } = useLogout();

    const handleLogout = () => {
        confirmDispatch(showConfirm({
            message: 'Xác nhận đăng xuất?',
            onConfirm: () => logout(),
            onReject: () => {}
        }))
    }
    
    return (
        <div>
            <div style={{height: '60px'}}></div>
            <div className="topbar">
                <div className="d-flex align-items-center">
                    <a href="/" className="ms-3">
                        <img src={band} alt="logo" className="img-fluid" />
                    </a>
                    <div className="flex-fill"></div>
                    <div className="d-flex me-4 align-items-center">

                        <i className='position-relative bx bx-cart me-3 fw-bold cart' onClick={() => navigate('cart')} style={{fontSize: '28px'}}>
                            <div className="cart-count">2</div>
                        </i>

                        { !user && <>
                            <Button label="Đăng nhập" className="me-1" onClick={navigateToLoginPage}></Button>
                            <Button label="Đăng kí" className="me-1" onClick={() => {}}></Button>
                        </> }

                        { user && <>
                            <div className="me-2">Xin chào Nguyên!</div>
                            <img src={user.avatarUrl || logo} alt="" className="avt pointer-hover" data-bs-toggle="dropdown"/>


                            {/* Option */}
                            <div className="dropdown-menu rounded-0 py-0">
                                <div className="dropdown-item" onClick={() => navigate('/admin')}><i className='bx bx-sushi'></i> Quản trị</div>
                                <div className="dropdown-item" onClick={() => navigate('/account')}><i className='bx bx-cog'></i> Tài khoản</div>
                                <div className="dropdown-item" onClick={handleLogout}><i className='bx bx-log-out'></i> Đăng xuất</div>
                            </div>
                        </> }

                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;