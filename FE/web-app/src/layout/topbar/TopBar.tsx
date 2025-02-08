import React, { useContext, useState } from "react";
import './TopBar.css'
import band from "../../assets/images/band.png"
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/test-img.jpg"
import { toast } from "react-toastify";
import Button from "../../components/button/Button.component";
import { useLoginDialog } from "../../features/login/LoginDialog.context";

const TopBar = () => {
    const navigate = useNavigate();
    const { showLoginDialog: show } = useLoginDialog();

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

                        {/* <div className="me-2">Xin chào Nguyên!</div>
                        <img src={logo} alt="" className="avt pointer-hover" data-bs-toggle="dropdown"/> */}

                        <Button label="Đăng nhập" className="me-1" onClick={() => show()}></Button>
                        <Button label="Đăng kí" className="me-1" onClick={() => {}}></Button>

                        {/* Option */}
                        <div className="dropdown-menu rounded-0 py-0">
                            <div className="dropdown-item" onClick={() => navigate('/register')}><i className='bx bx-user-plus'></i> Đăng kí</div>
                            <div className="dropdown-item"><i className='bx bx-log-in'></i> Đăng nhập</div>
                            <div className="dropdown-item" onClick={() => navigate('/admin')}><i className='bx bx-sushi'></i> Quản trị</div>
                            <div className="dropdown-item" onClick={() => navigate('/account')}><i className='bx bx-cog'></i> Quản lí</div>
                            <div className="dropdown-item"><i className='bx bx-log-out'></i> Đăng xuất</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;