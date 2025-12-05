import React, {useRef, useState } from "react";
import '../../styles/pages/ChangePass.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { AppDispatch } from "../../stores";
import { resetPassword, requestSendResetPasswordCode } from "../../api";
import { showErrorToast, showInfoToast, showSuccessToast } from "../../utils";
import { Loading, ValidatableInput } from "../../components";

export const ChangePass = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [ param ] = useSearchParams();

    const [password, setPassword] = useState<string>('');
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // handle login action
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
    const confirmCodeInputRef = useRef<HTMLInputElement>(null);

    const handleResetPassword = async () => {
        setLoading(true);
        setFormFocus(true);
        // handle autofill bug
        const email = emailInputRef.current?.value || '';
        const pass = passwordInputRef.current?.value || '';
        const confirmPassword = confirmPasswordInputRef.current?.value || '';
        const confirmCode = confirmCodeInputRef.current?.value || '';

        const resetResult = await resetPassword({
            email: email,
            code: confirmCode,
            confirmPassword: confirmPassword,
            password: pass
        });
        
        if (resetResult.isSuccess) {
            navigate((param.get('return_url') || '/login'));
            showSuccessToast(`Thay đổi mật khẩu thành công`);
        } else {
            showErrorToast(resetResult.message!);
        }
        
        setLoading(false);
    };

    const handleSendCode = async () => {
        const email = emailInputRef.current?.value || '';
        if (!email) {
            showInfoToast('Vui lòng nhập email để gửi mã xác thực')
            return
        }

        setLoading(true);
        const res = await requestSendResetPasswordCode(email);
        if (res.isSuccess) {
            showInfoToast('Mã xác thực đã được gửi đến ' + email + ',  vui lòng kiểm tra hộp thư để lấy mã xác thực')
        } else {
            showErrorToast(res.message!);
        }
        setLoading(false);
    }

    return (
        <div className="ChangePass">
            <div className="position-fixed bg-white vw-100 vh-100 fixed-top pt-3">
                <div className="col-lg-4 px-0 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2">
                    <div className="card card-body mt-3 rounded-0 p-3 shadow-sm">
                        <Loading isShow={loading}></Loading>
                        <h2 className="fw-bolder text-center">ZShop</h2>
                        <p className="fw-light text-center">Thay đổi mật khẩu</p>

                        <div className="px-2 mt-2">
                            {/* Email */}
                            <label className="mb-1 required">Email</label>
                            <ValidatableInput 
                                ref={emailInputRef}
                                id = "email"
                                type="text" 
                                isFormFocus={formFocus}
                                valueChange={val => {}}
                                validator={val => {
                                    if (!val) return `Email trống`;
                                    if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}$/.test(val))
                                        return `Email không hợp lệ`;
                                    return null;
                                }}/>

                            {/* Password */}
                            <label className="mb-1 required">Mật khẩu</label>
                            <ValidatableInput 
                                ref={passwordInputRef}
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
                            <label className="mb-1 required">Mật khẩu xác nhận</label>
                            <ValidatableInput 
                                ref={confirmPasswordInputRef}
                                isFormFocus={formFocus}
                                type="password" 
                                valueChange={val => {}} 
                                validator={val => null}
                                compareValue={password}
                                compareErrorMessage="Mật khẩu xác nhận không đúng."/>

                            {/*  Confirm code */}
                            <label className="mb-1 required">Mã xác nhận</label>
                            <div className="d-flex justify-content-between">
                                <ValidatableInput
                                    ref={confirmCodeInputRef}
                                    isFormFocus={formFocus}
                                    type="password" 
                                    valueChange={val => {}} 
                                    validator={val => {
                                        if (!val) return `Vui lòng nhập mã xác thực.`;
                                        return null;
                                    }}/>
                                <Button variant="outlined" className="ms-2 h-100" onClick={handleSendCode}>Gửi mã</Button>
                            </div>

                            <Button className="w-100 mt-3" variant="contained" color="info" onClick={handleResetPassword}>Đổi mật khẩu</Button>
                            <Button className="w-100 mt-2 mb-2" variant="outlined" onClick={() => navigate(-1)}>Quay lại</Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}