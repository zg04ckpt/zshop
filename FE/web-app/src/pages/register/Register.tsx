import React, { useEffect, useState } from "react";
import './Register.css';
import ValidationInput from "../../components/validation-input/ValidationInput.component";
import Button from "../../components/button/Button.component";
import ConfirmEmail from "../confirm-email/ConfirmEmail";

const Register = () => {

    const [value, setValue] = useState<string>('');
    const [value2, setValue2] = useState<string>('');
    const [errors, setErrors] = useState<{
        value?: string | null;
        value2?: string | null;
    }>({});
    
    useEffect(() => {
        const newErrors = { ...errors }; // Tạo một bản sao của errors để tránh thay đổi trực tiếp state
        newErrors.value = value.length < 5 ? 'Chuỗi dài < 5 kí tự' : null;
        newErrors.value2 = value2 !== value ? 'Không giống value' : null;
        setErrors(newErrors); // Cập nhật state bằng cách sử dụng setErrors
    }, [value, value2]);

    return (
        <div className="register row mt-4">
            <div className="col-6">
                <div className="ps-5">
                    <h1 className="fw-bolder">Đăng kí tài khoản <b>ZShop</b></h1>
                    <p>Vui lòng điền đầy đủ thông tin vào form đăng kí.</p>
                </div>
            </div>
            <div className="card col-6 card-body rounded-0 mt-3">
                
            
                <div className="row">
                    {/* Last name */}
                    <div className="col-6 pe-0">
                        <label className="mb-1 required">Họ đệm</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* First name */}
                    <div className="col-6">
                        <label className="mb-1 required">Tên</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* Email */}
                    <div className="col-8">
                        <label className="mb-1 required">Email</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* Email */}
                    <div className="col-4 ps-0">
                        <label className="mb-1 required">Số điện thoại</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* UserName */}
                    <div className="col-6 pe-0">
                        <label className="mb-1 required">Tên đăng nhập</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* Referral code */}
                    <div className="col-6">
                        <label className="mb-1">Mã giới thiệu</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    <div className="d-flex flex-column col-8 pe-0">
                        {/* Password */}
                        <label className="mb-1 required">Mật khẩu</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                        {/* Confirm Password */}
                        <label className="mb-1 required">Mật khẩu xác nhận</label>
                        <ValidationInput type="text" valueChange={val => setValue2(val)} errorMessage={errors.value2}/>
                    </div>
                    {/* Avt */}
                    <div className="col-4 pe-0 d-flex flex-column align-items-center">
                        <label>Ảnh đại diện</label>
                        <img src="" alt="" className="mt-2"/>
                        <Button label="Đổi ảnh" className="h-auto mt-2" onClick={() => {}}></Button>
                    </div>
                </div>

                {/* Action */}
                <div className="d-flex justify-content-center mt-3">
                    <button className="bg-black text-white me-2">Đăng kí</button>
                    <button className="py-1 d-flex justify-content-center align-items-center">
                        <div className="me-1">Tiếp tục với Google</div>
                        <svg width="16px" height="16px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>        
                    </button>
                </div>

                <label className="text-center mt-2 text-secondary" style={{fontSize: '14px'}}>Đã có tài khoản? 
                    <span className="act-text ms-1">Đăng nhập</span></label>
            </div>

            {/* Confirm Email Dialog */}

        </div>
    );
}

export default Register;