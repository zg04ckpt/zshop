import React, { useState } from "react";
import './ProductManagement.css';
import logo from "../../../../assets/images/test-img.jpg";
import Button from "../../../components/button/Button.component";
import ProductFilter from "../../../components/product-filter/ProductFilter.component";

const ProductManagement = () => {
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="product-management">

            <div className="d-flex align-items-center filter">
                <Button label="Lọc" onClick={() => setShowFilter(true)} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                <div className="flex-fill"></div>
                <Button label="Thêm sách" onClick={() => {}} icon={<i className='bx bx-plus'></i>}></Button>
            </div>

            <table className="w-100 mt-2">
                <thead>
                    <tr>
                        <th className="w-auto">#</th>
                        <th>Bìa</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Thể loại</th>
                        <th>Tác giả</th>
                        <th>Cập nhật</th>
                        <th>Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td><img src={logo} alt="" /></td>
                        <td>Truyện OnePuchMan</td>
                        <td>100.000 VNĐ</td>
                        <td>Managa, Phiêu lưu</td>
                        <td>H.C.Nguyên</td>
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

export default ProductManagement;