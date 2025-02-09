import React, { useState } from "react";
import './CateManagement.css';
import logo from "../../../../assets/images/test-img.jpg";
import Button from "../../../components/button/Button";

const CateManagement = () => {
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="cate-management">

            <div className="d-flex mt-2">
                <Button label="Lọc" onClick={() => setShowFilter(true)} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                <div className="flex-fill"></div>
            </div>

            <table className="w-100 mt-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Bìa</th>
                        <th>Tên thể loại</th>
                        <th>Cha</th>
                        <th>Cập nhật</th>
                        <th>Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td><img src={logo} alt="" /></td>
                        <td>Managa</td>
                        <td>Gốc</td>
                        <td>3 ngày trước</td>
                        <td>
                            <div className="d-flex action mt-2">
                                <i className='bx bx-plus'></i>
                                <i className='bx bx-minus'></i>
                                <i className='bx bx-trash-alt'></i>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default CateManagement;