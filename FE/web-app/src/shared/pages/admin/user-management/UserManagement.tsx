import React, { useState } from "react";
import './UserManagement.css';
import Button from "../../../components/button/Button";
import ProductFilter from "../../../components/product-filter/ProductFilter";

const UserManagement = () => {
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="user-management">

            {/* Top action */}
            <div className="d-flex mt-2">
                <Button label="Lọc" onClick={() => setShowFilter(true)} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                <div className="flex-fill"></div>
            </div>

            <table className="w-100 mt-2">
                <thead>
                    <tr>
                        <th className="w-auto">#</th>
                        <th>Tên</th>
                        <th>Username</th>
                        <th>Trạng thái</th>
                        <th>Quyền</th>
                        <th>Đăng nhập</th>
                        <th>Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Truyện OnePuchMan</td>
                        <td>nguyencao142</td>
                        <td className="align-content-center"><div className="tag tag-online">online</div></td>
                        <td>admin</td>
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

            {/* Filter dialog */}
            { showFilter && (
                <div className="cover-all-bg filter-dialog">
                    <div className="filter position-absolute rounded-0 start-50 translate-middle-x">
                        <div className="btn-close position-absolute end-0 top-0 m-1" onClick={() => setShowFilter(false)} style={{zIndex: '3'}}></div>
                        <ProductFilter/>
                    </div>
                </div>
            ) }
        </div>
    );
}

export default UserManagement;