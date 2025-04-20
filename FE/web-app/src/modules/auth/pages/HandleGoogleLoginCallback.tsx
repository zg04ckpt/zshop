import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, endLoadingStatus, setUser, showErrorToast, showSuccessToast, startLoadingStatus } from "../../shared";
import { getGoogleLoginResultApi } from "../services/authApi";
import { saveLocalUser, saveToken } from "..";
import { useNavigate } from "react-router-dom";

const HandleGoogleLoginCallback = () => {
    const dispatch = useDispatch<AppDispatch>();
    const nav = useNavigate();;

    const handle = async () => {
        dispatch(startLoadingStatus());
        const res = await getGoogleLoginResultApi();
        if (res.isSuccess) {
            saveLocalUser(res.data!.user);
            saveToken(res.data!.token);
            dispatch(setUser(res.data!.user));
            showSuccessToast(`Đăng nhập thành công, xin chào ${res.data!.user.firstName}`);
        }
        else {
            showErrorToast(res.message!);
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