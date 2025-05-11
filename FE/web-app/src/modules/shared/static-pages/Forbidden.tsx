import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Forbidden = () => {
    const navigate = useNavigate();
    return (
        <div className="position-fixed bg-white vw-100 vh-100 fixed-top d-flex flex-column align-items-center">
            <div className="fw-bolder" style={{fontSize: '120px'}}>403</div>
            <i className="fas fa-lock text-center text-bg-danger rounded-pill p-5 align-content-center" style={{fontSize: '100px', width: '200px', height: '200px'}}></i>
            <p className="mt-3 fst-italic fs-5">You are not allowed to do this action</p>
            <div className="d-flex justify-content-center">
                <Button variant="outlined" onClick={() => navigate('/')}>Trang chủ</Button>
                {/* <Button variant="contained" className="ms-2" onClick={() => navigate(-1)}>Quay lại</Button> */}
            </div>
        </div>
    );
}

export default Forbidden;