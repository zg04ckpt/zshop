import React, { useContext, useEffect, useRef, useState } from "react";
import './Login.page.css';
import ReactDOM, { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/loading/Loading.component";
import { toast } from "react-toastify";
import { useLogin } from "../../../features/auth";
import { ValidatableInput } from "../../components/validatable-input/ValidatableInput.component";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const { loading, login } = useLogin();

    // handle login action
    const handleLogin = async () => {
        setFormFocus(true);
        const user = await login({
            email: email,
            password: password
        });
        if(user) {
            toast.success(`Xin chào ${user!.firstName}`);
            window.history.back();
        }
    }

    return (
        <div className="login-dialog">
            <div className="row">
                <div className="col-lg-4 px-0 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2">

                    <div className="card card-body mt-3 rounded-0 p-3">
                        <Loading isShow={loading} />
                        <h2 className="fw-bolder text-center">Đăng nhập ZShop</h2>
                        <p className="fw-light text-center">Chào mừng bạn quay trở lại!</p>

                        <div className="px-2 mt-3">
                            <label className="text-end"><a href="" className="text-end mb-0 mt-3">Quên mật khẩu?</a></label>
                            
                            {/* Email */}
                            <label className="mb-1 required">Email</label>
                            <ValidatableInput 
                                type="text" 
                                isFormFocus={formFocus}
                                valueChange={val => setEmail(val)}
                                validator={val => {
                                    if (!val) return `Email trống`;
                                    if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}$/.test(val))
                                        return `Email không hợp lệ`;
                                    return null;
                                }}/>

                            {/* Password */}
                            <label className="mb-1 required">Mật khẩu</label>
                            <ValidatableInput 
                                type="password" 
                                isFormFocus={formFocus}
                                valueChange={val => setPassword(val)}
                                validator={val => {
                                    if (!val) return `Mật khẩu trống`;
                                    return null;
                                }}/>

                            <button className={`w-100 mt-3 bg-black text-white login`} onClick={() => handleLogin()}>Đăng nhập</button>
                            <button className="w-100 mt-2 py-1 d-flex justify-content-center align-items-center">
                                <div className="me-1">Tiếp tục với Google</div>
                                <svg width="16px" height="16px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>        
                            </button>
                            
                            <label className="text-center mt-2 text-secondary" style={{fontSize: '14px'}}>Chưa có tài khoản? <span className="act-text" onClick={() => navigate('/register')}>Đăng kí</span></label>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;