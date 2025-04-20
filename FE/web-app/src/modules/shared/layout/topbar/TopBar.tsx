import React, { useContext, useRef, useState } from "react";
import './TopBar.css'
import band from "../../../../assets/images/band.png";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import { defaultImageUrl, RootState, useAppContext } from "../..";
import { LocalUser, useAuth } from "../../../auth";
import { useSelector } from "react-redux";
import { LinearProgress } from "@mui/material";

const TopBar = () => {
    const appContext = useAppContext();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const user: LocalUser|null = useSelector((state: RootState) => state.auth.user);
    const isLoading: boolean = useSelector((state: RootState) => state.loading);
    const keyRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        appContext!.showConfirmDialog({
            message:'Xác nhận đăng xuất?',
            onConfirm: async () => {
                if(await logout()) {
                    // back to home
                    navigate('/');
                }
            },
            onReject: () => {}
        });

    }
    
    return (
        <>
            <div className="w-100" style={{height: '50px'}}></div>
            <div className="topbar">
                <div className="d-flex align-items-center">
                    <a href="/" className="ms-3">
                        <img src={band} alt="logo" className="img-fluid" />
                    </a>

                    {/* <label className="position-relative h-100 me-3">
                        <label className="topbar-item">
                            Danh mục 
                            <i className="fa-solid fa-chevron-down ms-1"></i>
                        </label>

                        <div className="cate-list position-absolute mt-3 shadow-sm">
                            <div className="row g-2">
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                                <div className="col-6">
                                    <a href="" className="cate-item">Danh mục</a>
                                </div>
                            </div>
                        </div>
                    </label> */}

                    {/* Search */}
                    <div className="d-flex search">
                        <input ref={keyRef} type="text" className="rounded-pill px-3" placeholder="Tên sách / tác giả"/>
                        <button className="ms-1 h-100 rounded-pill px-2" onClick={() => {
                            if (keyRef.current?.value) {
                                navigate(`/search?k=${keyRef.current?.value}`)
                            }
                        }}>
                            <i className="fa-solid fa-magnifying-glass" ></i> Tìm kiếm
                        </button>
                    </div>

                    <div className="flex-fill"></div>

                    <a href="/account/payment-history" className="me-3 topbar-item text-decoration-none text-dark">
                        <i className="fa-solid fa-file-invoice me-2"></i>
                        Đơn hàng của tôi
                    </a>

                    <div className="d-flex me-4 align-items-center ">

                        <i className='position-relative bx bx-cart me-3 fw-bold cart' onClick={() => navigate('cart')} style={{fontSize: '28px'}}>
                            <div className="cart-count">2</div>
                        </i>

                        { !user && <>
                            <Button label="Đăng nhập" className="me-1" onClick={() => navigate('/login')}></Button>
                            <Button label="Đăng kí" className="me-1" onClick={() => {navigate('/register')}}></Button>
                        </> }

                        { user && <>
                            <div className="me-2">Xin chào {user.firstName}!</div>
                            <img src={user.avatarUrl || defaultImageUrl} alt="" className="avt pointer-hover" data-bs-toggle="dropdown"/>

                            {/* Option */}
                            <div className="dropdown-menu rounded-0 py-0">
                                <div className="dropdown-item" onClick={() => navigate('/admin')}><i className='bx bx-sushi'></i> Quản trị</div>
                                <div className="dropdown-item" onClick={() => navigate('/account')}><i className='bx bx-cog'></i> Tài khoản</div>
                                <div className="dropdown-item" onClick={handleLogout}><i className='bx bx-log-out'></i> Đăng xuất</div>
                            </div>
                        </> }

                    </div>
                </div>
                <div className="position-absolute top-100 start-0 vw-100">
                    { isLoading && <LinearProgress /> }
                </div>
            </div>
        </>
    );
}

export default TopBar;