import React from "react";
import './BookFilter.css';
import { Button } from "../../../shared";

const BookFilter = () => {
    const testData = []
    for (let i = 0; i < 50; i++) {
        testData.push(i)
    }
    return (
        <div className="card card-body rounded-0 d-flex flex-column" style={{position: 'sticky', top: '70px'}}>
            <h6><i className='bx bxs-filter-alt'></i> Bộ lọc</h6>

            {/* Category */}
            <label>Danh mục <i className="text-secondary">(Đã chọn 2)</i></label>
            <div className=" list-cate scrollable vertical-scrollable" style={{maxHeight: '100px'}}>
                {
                    testData.map(e => (
                        <div className="d-flex" key={e}>
                            <input type="checkbox"/>
                            <div className="ms-2 max-1-line fw-bold">Danh mục {e}</div>
                        </div>
                    ))
                }
            </div>

            {/* Name */}
            <label className="mt-2">Tên</label>
            <input type="text" placeholder="Nhập tên sách muốn tìm"/>

            {/* Giá */}
            <label className="mt-2">Giá thấp nhất <i>(VNĐ)</i></label>
            <input type="number"/>
            <label className="mt-2">Giá cao nhất <i>(VNĐ)</i></label>
            <input type="number"/>

            {/* Sort */}
            <label className="mt-2">Sắp xếp theo</label>
            <select name="" id="">
                <option value="">Mới nhất</option>
                <option value="">Cũ nhất</option>
                <option value="">Bán nhiều nhất</option>
                <option value="">Rẻ nhất</option>
                <option value="">Đắt nhất</option>
            </select>

            {/* Action */}
            <div className="d-flex mt-3">
                <Button className="col me-1" label="Đặt lại" onClick={() => {}}></Button>
                <Button className="col bg-black text-white" label="Áp dụng" onClick={() => {}}></Button>
            </div>
        </div>
    );
}

export default BookFilter;