import React, { useEffect, useState } from "react";
import './ConfirmEmail.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../..";
import { serverApi, Loading, showErrorToast } from "../../../shared";

const ConfirmEmail = () => {
    const { resendEmailConfirmCode, confirmEmail, apiLoading } = useAuth();
    const navigate = useNavigate();

    const [queryParams] = useSearchParams();
    const email = queryParams.get('email');
    const returnUrl = queryParams.get('return_url');
    const [remaining, setRemaining] = useState<number>(0);
    const [code, setCode] = useState<string>('');
    
    useEffect(() => {
        if (!email) {
            showErrorToast(`Email xác nhận không hợp lệ`);
            navigate('/' + returnUrl || '');
        }
    }, []);

    const handleResendConfirmEmail = async () => {
        if(await resendEmailConfirmCode(email!)) {
            setRemaining(60);
            const subId = setInterval(() => {
                setRemaining(prev => {
                    if (prev === 0) {
                        clearInterval(subId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const handleConfirmEmailAction = async () => {
        if(!code) {
            showErrorToast('Vui lòng điền mã xác thực');
            return;
        }

        if (await confirmEmail(email!, code)) {
            navigate('/' + returnUrl || '');
        }
    }

    return (
        <div className="confirm-email-dialog mt-3">
            <div className="card card-body rounded-0 p-3 position-absolute start-50 translate-middle-x">
                <Loading isShow={apiLoading} />
                <h2 className="fw-bolder text-center">Xác thực email</h2>
                <div className="px-2 mt-0 text-center">
                    <p className="fw-light text-center">Vui lòng nhập mã xác thực 6 số được gửi đến {email}</p>

                    <input onChange={e => setCode(e.target.value)} type="text" className="fs-3 text-center fw-bolder p-1" style={{ width: '200px' }}/>

                    <div className="d-flex mt-3 justify-content-center">
                        <button className={`d-flex justify-content-center align-items-center ${remaining != 0? 'locked':''}`} onClick={() => handleResendConfirmEmail()}>
                            <div>Gửi lại</div>{remaining != 0 && <div>({remaining})</div>} 
                        </button>
                        <button className="bg-black text-white ms-1" onClick={() => handleConfirmEmailAction()}>Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;