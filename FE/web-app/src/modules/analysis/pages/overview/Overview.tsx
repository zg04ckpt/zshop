import React from "react";
import './Overview.css';

const Overview = () => {
    return (
        <div className="overview">

            <select name="" id="" className="my-2">
                <option value="">Hôm nay</option>
                <option value="">Hôm qua</option>
                <option value="">Tháng này</option>
                <option value="customer">Tùy chỉnh</option>
            </select>

            <div className="mt-2">
                <h5>Thông tin chung</h5>
                <div className="d-flex flex-row">

                    <div className="card px-3 py-2 me-3 shadow-sm">
                        <div className="d-flex flex-column">
                            <h5 className="mb-0" >Lượng truy cập</h5>
                            <hr className="my-2"/>
                            <h3 className="fw-bolder mb-0 text-center">18/120</h3>
                        </div>
                    </div>

                    <div className="card px-3 py-2 me-3 shadow-sm">
                        <div className="d-flex flex-column">
                            <h5 className="mb-0" >Đơn hàng phát sinh</h5>
                            <hr className="my-2"/>
                            <h3 className="fw-bolder mb-0 text-center">12/13</h3>
                        </div>
                    </div>

                    <div className="card px-3 py-2 me-3 shadow-sm">
                        <div className="d-flex flex-column">
                            <h5 className="mb-0" >Doanh thu</h5>
                            <hr className="my-2"/>
                            <h3 className="fw-bolder mb-0 text-center">12</h3>
                        </div>
                    </div>

                    <div className="card px-3 py-2 me-3 shadow-sm">
                        <div className="d-flex flex-column">
                            <h5 className="mb-0" >Lợi nhuận</h5>
                            <hr className="my-2"/>
                            <h3 className="fw-bolder mb-0 text-center">2</h3>
                        </div>
                    </div>
                </div>
            </div>

            

        </div>
    );
}

export default Overview;