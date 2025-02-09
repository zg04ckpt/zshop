import React from "react";
import './Order.css'
import testLogo from "../../../assets/images/test-img.jpg";
import Button from "../../components/button/Button.component";

const Order = () => {
    return (
        <div className="row order">
            {/* Left */}
            <div className="col-8 pe-0">
                <div className="card card-body rounded-0 mt-2">
                    <h5 className="mb-3 ps-2">Đặt hàng</h5>

                    {/* Product list */}
                    <label className="label">Danh sách sản phẩm (2)</label>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{width: '100px'}}>Bìa</th>
                                <th>Tên sách</th>
                                <th style={{width: '100px'}}>Số lượng</th>
                                <th style={{width: '120px'}}>Đơn giá</th>
                                <th style={{width: '120px'}}>Thay đổi</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
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

                    {/* Voucher */}
                    <div className="label mt-3">Mã giảm giá <i style={{fontSize: '14px'}}>(* Lưu ý những mã cùng loại sẽ chỉ áp dụng mã cuối cùng được thêm)</i></div>
                    <div className="d-flex vouchers mt-2">

                        <div className="voucher me-2 d-flex">
                            <div>KHUYEN MAI 15/1 </div>
                            <i className='bx bx-x'></i></div>

                        <Button label="Thêm voucher" onClick={() => {}}></Button>
                    </div>

                    {/* Receiver Info */}
                    <div className="label mt-3">Thông tin nhận hàng</div>
                    <div className="d-flex flex-column address mt-2 p-2 position-relative">
                        <div className="d-flex align-items-center">
                            <i className='bx bx-user'></i>
                            <div className="ms-2">Hoàng Cao Nguyên</div>
                            <i className='bx bx-phone ms-3'></i>
                            <div className="ms-2">0375885950</div>
                        </div>

                        <div className="d-flex align-items-center">
                            <i className='bx bx-home-alt'></i>
                            <div className="ms-2 max-1-line">Số 8E, ngõ 19, phố Phan Châu Trinh, Hoài Đức, Hà Nội Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum nemo ipsa, saepe veniam modi odio voluptatibus similique beatae, unde, repellendus delectus atque ea. Accusantium ea blanditiis quam tempora eveniet! Nisi.</div>
                        </div>
                        
                        
                        <i className='bx bx-edit-alt change-address' title="Thay đổi địa chỉ"></i>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="col-4">
                <div className="card card-body rounded-0 mt-2 position-sticky" style={{top: '70px'}}>
                    {/* Total */}
                    <div className="label">Chi tiết</div>
                    <table>
                        <tr>
                            <th>Tổng cộng:</th>
                            <td className="text-end">360.000</td>
                        </tr>
                        <tr>
                            <th>Phí vận chuyển:</th>
                            <td className="text-end">60.000</td>
                        </tr>
                        <tr>
                            <th>Khuyến mại:</th>
                            <td className="text-end">-55.000</td>
                        </tr>
                        <tr>
                            <th>Voucher:</th>
                            <td className="text-end">-55.000</td>
                        </tr>
                        <tr>
                            <th>Thanh toán:</th>
                            <td className="text-end fw-bold fst-italic">555.000 VNĐ</td>
                        </tr>
                    </table>
                    
                    {/* Payment method */}
                    <label className="label mt-3">Hình thức thanh toán</label>
                    <select className="mt-2" style={{width: 'fit-content'}}>
                        <option value="">(Trực tiếp) Thanh toán khi nhận hàng</option>
                        <option value="">(Online) Thanh toán qua VNPay</option>
                    </select>
                    <Button label="Đặt hàng" className="mt-3" onClick={() => {}}></Button>
                    <Button label="Thanh toán ngay" className="mt-3" onClick={() => {}}></Button>
                </div>
            </div>
        </div>
        
    );
}

export default Order;