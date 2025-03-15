import React from "react";
import './Cart.css';
import { Button, defaultImageUrl } from "../../../shared";

const Cart = () => {
    return (
        <div className="cart">
            <h4 className="my-3 label ps-2">Giỏ hàng</h4>

            <div className="row g-2">
                {/* Product list */}
                <div className="col-md-8">
                    <div className="card card-body rounded-0 p-2">
                        <div className="d-flex align-items-center ps-2">
                            <small><i>(Đã chọn 2)</i></small>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{width: '10px'}}><input type="checkbox" title="Chọn tất"/></th>
                                    <th style={{width: '100px'}}>Bìa</th>
                                    <th>Tên sách</th>
                                    <th style={{width: '100px'}}>Số lượng</th>
                                    <th style={{width: '120px'}}>Đơn giá</th>
                                    <th style={{width: '120px'}}>Thay đổi</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td><input type="checkbox"/></td>
                                    <td><img src={defaultImageUrl} alt="" /></td>
                                    <td>Truyện One PuchMan</td>
                                    <td>x2</td>
                                    <td>180.000 VNĐ</td>
                                    <td>
                                        <div className="d-flex change-action">
                                            <i className='bx bx-plus'></i>
                                            <i className='bx bx-minus'></i>
                                            <i className='bx bx-trash-alt'></i>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total */}
                <div className="col-md-4">
                    <div className="card card-body position-sticky rounded-0 p-2 d-flex flex-column align-items-center"
                    style={{top: '60px'}}>
                        <h4 className="fw-light mb-0">Tổng tiền</h4>
                        <div className="total-price my-2">180.000 VNĐ</div>
                        <Button className="mb-2" blackTheme pxWidth={200} pxSize={20} onClick={() => {}} label="Thanh toán ngay"></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;