import React, { useEffect, useState } from "react";
import './Register.css';
import { hasIn, values } from "lodash";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { loginWithGoogleApi, useAuth } from "../..";
import { Loading, ValidatableInput } from "../../../shared";

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Prop
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [referralCode, setReferralCode] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [formFocus, setFormFocus] = useState<boolean>(false);
    const { register , apiLoading, logout} = useAuth();

    // handle register api
    const handleRegisterAction = async () => {
        await logout();
        setFormFocus(true);
        if(await register({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            userName: userName,
            confirmPassword: confirmPassword,
            phoneNumber: phoneNumber
        })) {
            navigate(`/confirm-email?email=${email}&return_url=${searchParams.get('return_url') || ''}`);
        }
    }

    return (
        <div className="register container-lg">
            <div className="row mt-4">
                <div className="col-6">
                    <h1 className="fw-bolder">Đăng kí tài khoản <b>ZShop</b></h1>
                    <p>Vui lòng điền đầy đủ thông tin vào form đăng kí.</p>
                </div>
                <div className="card col-6 card-body rounded-0 mt-3">
                    <Loading isShow={apiLoading}/>
                    <div className="row">
                        {/* Last name */}
                        <div className="col-6 pe-0">
                            <label className="mb-1 required">Họ đệm</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text" 
                                valueChange={val => setLastName(val)} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                        </div>

                        {/* First name */}
                        <div className="col-6">
                            <label className="mb-1 required">Tên</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text" 
                                valueChange={val => setFirstName(val)} 
                                validator={val => {
                                    if (!val) return "Tên không được bỏ trống";
                                    return null;
                                }}/>
                        </div>

                        {/* Email */}
                        <div className="col-8">
                            <label className="mb-1 required">Email</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text" 
                                valueChange={val => setEmail(val)} 
                                validator={val => {
                                    if (!val) return `Email không được bỏ trống.`;
                                    if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}$/.test(val))
                                        return `Email không hợp lệ`;
                                    return null;
                                }}/>
                        </div>

                        {/* PhoneNumber */}
                        <div className="col-4 ps-0">
                            <label className="mb-1 required">Số điện thoại</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text" 
                                valueChange={val => setPhoneNumber(val)} 
                                validator={val => {
                                    if (!val) return `Số điện thoại không được bỏ trống.`;
                                    if (!/^[0-9]+$/.test(val))
                                        return `Số điện thoại chỉ chứa chữ số`;
                                    return null;
                                }}/>
                        </div>

                        {/* UserName */}
                        <div className="col-6 pe-0">
                            <label className="mb-1 required">Tên đăng nhập</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text" 
                                valueChange={val => setUserName(val)} 
                                validator={val => {
                                    if (!val) return `Tên đăng nhập không được bỏ trống.`;
                                    if (!/^[a-zA-Z0-9]{4,16}$/.test(val))
                                        return `Tên người dùng chỉ được chứa chữ cái (không dấu), chữ số và dài 4-16 kí tự.`;
                                    return null;
                                }}/>
                        </div>
                        {/* Referral code */}
                        <div className="col-6">
                            <label className="mb-1">Mã giới thiệu</label>
                            <ValidatableInput 
                                type="text" 
                                valueChange={val => setReferralCode(val)} 
                                validator={val => null}/>
                        </div>
        
                        <div className="d-flex flex-column col-8 pe-0 mt-3">
                            {/* Password */}
                            <label className="mb-1 required">Mật khẩu</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="password" 
                                valueChange={val => setPassword(val)} 
                                validator={val => {
                                    if (!val) return `Mật khẩu không được bỏ trống.`;
                                    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!.#@$-]{8,16}$/.test(val))
                                        return `Mật khẩu phải chứa chữ cái in thường, in hoa, chữ số và dài từ 8-16 kí tự, có thể chứa kí tự đặc biệt (!.#@$-)`;
                                    return null;
                                }}/>

                            {/* Confirm Password */}
                            <label className="mb-1 mt-3 required">Mật khẩu xác nhận</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="password" 
                                valueChange={val => setConfirmPassword(val)} 
                                validator={val => null}
                                compareValue={password}
                                compareErrorMessage="Mật khẩu xác nhận không đúng."/>
                        </div>

                        {/* Avt */}
                        {/* <div className="col-4 pe-0 d-flex flex-column align-items-center">
                            <label>Ảnh đại diện</label>
                            <img src="" alt="" className="mt-2"/>
                            <Button label="Đổi ảnh" className="h-auto mt-2" onClick={() => {}}></Button>
                        </div> */}
                    </div>

                    {/* Action */}
                    <div className="d-flex justify-content-center mt-3">
                        <button className="bg-black text-white me-2" onClick={() => handleRegisterAction()}>Đăng kí</button>
                        <button onClick={() => loginWithGoogleApi()} className="border-1 border border-secondary py-1 d-flex justify-content-center align-items-center">
                            <div className="me-1">Tiếp tục với Google</div>
                            <svg width="16px" height="16px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>        
                        </button>
                    </div>

                    <label className="text-center mt-2 text-secondary" style={{fontSize: '14px'}}>Đã có tài khoản? 
                        <span className="act-text ms-1" onClick={() => navigate('/login')}>Đăng nhập</span></label>
                </div>
            </div>

            {/* Confirm Email Dialog */}
            {/* { status == RegisterStatus.ConfirmEmail && (
                <div className="cover-all-bg">
                    <div className="card card-body p-3 position-absolute start-50 translate-middle-x" style={{width: '400px', marginTop: '50px'}}>
                        <Loading isShow={loading.confirm}/>
                        <h2 className="fw-bolder text-center">Xác thực email</h2>
                        <div className="px-2 mt-0 text-center">
                            <p className="fw-light text-center">Vui lòng nhập mã xác thực 6 số được gửi đến {email} </p>
            
                            <input onChange={e => setConfirmEmailCode(e.target.value)} type="text" className="fs-3 text-center fw-bolder p-1" style={{width: '200px'}}/>
                
                            <div className="d-flex mt-3 justify-content-center">
                                <button className={`${remainingTime != 0? 'disabled':''}`} style={{width: '100px'}} onClick={() => handleResendConfirmEmail()}>
                                    <div style={{fontSize: '13px'}}>Gửi lại { remainingTime != 0 && <>({remainingTime})</> }</div> 
                                </button>
                                <Button label="Xác nhận" onClick={() => handleConfirmEmailAction()} pxWidth={100} blackTheme className="ms-1 fs-2">Xác nhận</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}      */}
        </div>
    );
}

export default Register;