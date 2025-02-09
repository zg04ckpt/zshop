import React from "react";
import './Address.css';
import Button from "../../../components/button/Button";

const Address = () => {
    return (
        <div className="address">
            <div className="card card-body rounded-0 ">
                <div className="d-flex flex-column">
                    <Button icon={<i className='bx bx-plus-circle'></i>} label="Thêm địa chỉ mới" onClick={() => {}}></Button>

                    <div className="d-flex flex-column address-option mt-3 p-2 position-relative">
                        <Button className="mb-2" label="Đặt làm mặc định" onClick={() => {}}></Button>
                        
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
                        
                        <div className="change-address d-flex">
                            <i className='bx bx-edit-alt ' title="Thay đổi địa chỉ"></i>
                            <i className='bx bx-trash' title="Xóa địa chỉ này"></i>
                        </div>
                    </div>

                    <div className="d-flex flex-column address-option default mt-3 p-2 position-relative">
                        
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
                        
                        <div className="change-address d-flex">
                            <i className='bx bx-edit-alt ' title="Thay đổi địa chỉ"></i>
                            <i className='bx bx-trash' title="Xóa địa chỉ này"></i>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Address;