import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, endLoadingStatus, setUser, showErrorToast, showSuccessToast, startLoadingStatus } from "../../shared";
import { useNavigate, useSearchParams } from "react-router-dom";

const HandleGoogleLoginCallback = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [params] = useSearchParams();
    const nav = useNavigate();;

    const handle = async () => {
        dispatch(startLoadingStatus());
        // const res = await getLoginInfo();
        // if (res.isSuccess) {
        //     dispatch(setUser(res.data!));
        //     showSuccessToast(`Đăng nhập thành công, xin chào ${res.data!.firstName}`);
        // }
        // else {
        //     showErrorToast(res.message!);
        // }
        const isSuccess = params.get('success');
        if (isSuccess && isSuccess == 'true') {
            showSuccessToast(`Đăng nhập thành công!`);
        } else {
            showErrorToast(`Đăng nhập thất bại!`)
        }
        dispatch(endLoadingStatus());
        nav('/');
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

export default HandleGoogleLoginCallback;