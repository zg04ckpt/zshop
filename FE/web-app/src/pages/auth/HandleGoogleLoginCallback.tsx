import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppDispatch, endLoadingStatus, startLoadingStatus } from "../../stores";
import { showErrorToast, showSuccessToast } from "../../utils";
import { saveToLocal } from "../../utils/localStore";

export const HandleGoogleLoginCallback = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [params] = useSearchParams();
    const nav = useNavigate();

    const handle = async () => {
        dispatch(startLoadingStatus());

        const isSuccess = params.get('success');
        if (isSuccess && isSuccess == 'true') {
            showSuccessToast(`Đăng nhập thành công!`);
            saveToLocal("isLoggedIn", true);
        } else {
            showErrorToast(`Đăng nhập thất bại!`)
        }
        dispatch(endLoadingStatus());

        setTimeout(() => {
            nav('/');
        }, 2000);
    }

    useEffect(() => {
        handle();
    }, []);

    return (
        <div>
            <h5 className="text-center mt-5">Hệ thống đang xử lý, vui lòng đợi trong giây lát...</h5>
        </div>
    );
}
