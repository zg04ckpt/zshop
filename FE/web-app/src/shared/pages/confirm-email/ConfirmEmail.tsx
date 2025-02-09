import React, { useState } from "react";
import './ConfirmEmail.css';
import Loading from "../../components/loading/Loading";

const ConfirmEmail = () => {
    const [remaining, setRemaining] = useState(0);
    const resend = () => {
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
    };

    return (
        <div className="confirm-email-dialog mt-3">
            <div className="card card-body rounded-0 p-3 position-absolute start-50 translate-middle-x">
                <Loading isShow={true} />
                <h2 className="fw-bolder text-center">Xác thực email</h2>
                <div className="px-2 mt-0 text-center">
                    <p className="fw-light text-center">Vui lòng nhập mã xác thực 6 số được gửi đến nguyen1402ckpt2k4@gmail.com</p>

                    <input type="text" className="fs-3 text-center fw-bolder p-1" style={{ width: '200px' }}/>

                    <div className="d-flex mt-3 justify-content-center">
                        <button className={`d-flex justify-content-center align-items-center ${remaining != 0? 'locked':''}`} onClick={() => resend()}>
                            <div>Gửi lại</div>{remaining != 0 && <div>({remaining})</div>} 
                        </button>
                        <button className="bg-black text-white ms-1">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;