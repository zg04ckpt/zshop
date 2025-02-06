import React from "react";
import './Cart.css'
import Button from "../../components/button/Button.component";
import testLogo from "../../assets/images/test-img.jpg";

const Cart = () => {
    return (
        <div className="card card-body rounded-0 mt-2 cart">
            <h5 className="mb-3 ps-2">Giỏ hàng (2)</h5>

            <div className="d-flex align-items-center ps-2">
                <small><i>(Đã chọn 2)</i></small>
                <div className="flex-fill"></div>
                <label>Tổng cộng: </label>
                <div className="total-price mx-3">180.000 VNĐ</div>
                <Button onClick={() => {}} label="Thanh toán ngay"></Button>
            </div>

            {/* Product list */}
            <table className="table mt-3">
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
                        <td><img src={testLogo} alt="" /></td>
                        <td>Truyện One PuchMan</td>
                        <td className="text-center">x2</td>
                        <td>180.000 VNĐ</td>
                        <td>
                            <div className="d-flex change-action justify-content-center">
                                <i className='bx bx-plus'></i>
                                <i className='bx bx-minus'></i>
                                <i className='bx bx-trash-alt'></i>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><input type="checkbox"/></td>
                        <td><img src={testLogo} alt="" /></td>
                        <td>Truyện One PuchMan</td>
                        <td className="text-center">x2</td>
                        <td>180.000 VNĐ</td>
                        <td>
                            <div className="d-flex change-action justify-content-center">
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

export default Cart;