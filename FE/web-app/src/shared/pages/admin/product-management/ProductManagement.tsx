import React, { useState } from "react";
import testLogo from "../../../../assets/images/test-img.jpg";
import './ProductManagement.css';
import logo from "../../../../assets/images/test-img.jpg";
import Button from "../../../components/button/Button";
import ProductFilter from "../../../components/product-filter/ProductFilter";
import { ValidatableInput } from "../../../components/validatable-input/ValidatableInput";

enum Status {
    List,
    Create,
    Update
}

const ProductManagement = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [status, setStatus] = useState<Status>(Status.List);
    const [formFocus, setFormFocus] = useState<boolean>(false);

    return (
        <div className="product-management">
            { status == Status.List && (
                <>
                    {/* Top action */}
                    <div className="d-flex align-items-center filter">
                        <Button label="Lọc nâng cao" onClick={() => setShowFilter(true)} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                        <Button label="Làm mới" className="ms-2" onClick={() => setShowFilter(true)}></Button>
                        <div className="flex-fill"></div>
                        <Button label="Thêm sách" onClick={() => setStatus(Status.Create)} icon={<i className='bx bx-plus'></i>}></Button>
                    </div>

                    {/* Quick config */}
                    <div className="d-flex align-items-center quick-setting">
                        <input type="checkbox" checked/>
                        <div className="ms-1 me-3">Bìa</div>
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
                                        <i className='bx bxs-hot' title="Đặt là nổi bật"></i>
                                        <i className='bx bx-bar-chart-alt-2' title="Thông số bán hàng"></i>
                                        <i className='bx bx-pencil'></i>
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
                </>
            )}

            { status == Status.Create && (
                <>
                    <div className="d-flex my-2">
                    <Button label="Quay lại danh sách"
                            icon={<i className='bx bx-chevron-left'></i>} 
                            onClick={() => setStatus(Status.List)}></Button>
                    </div>
                    <h5 className="label">Thêm sách mới</h5>
                    <div className="row">
                        <div className="col-md-6">
                            {/* Name */}
                            <label >Tên sách</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    {/* Cover */}
                                    <label className="">Bìa sách</label>
                                    <div className=" text-center">
                                        <img src={testLogo} alt="" />
                                        <label className="upload-img mt-2 pointer-hover">
                                            Tải ảnh lên
                                            <input type="file" accept=".PNG, .JPG" hidden onChange={e => {}}/>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    {/* Author */}
                                    <label className="">Tên tác giả</label>
                                    <ValidatableInput
                                        isFormFocus={formFocus}
                                        type="text"
                                        valueChange={val => {}} 
                                        validator={val => {
                                            if (!val) return "Họ đệm không được bỏ trống";
                                            return null;
                                        }}/>

                                    {/* Categories */}
                                    <div className="d-flex">
                                        <label className="">Thể loại</label>
                                        <div className="flex-fill"></div>
                                        <a href="" className="text-decoration-none d-flex align-items-center" data-bs-toggle="dropdown">
                                            <i className='bx bx-plus'></i>
                                            <div>Thêm thể loại</div>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end rounded-0 py-0">
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column cate-list mt-2">
                                        <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                            <div>Tiên hiệp, kiếm hiệp</div>
                                            <i className='bx bx-x'></i>
                                        </div>

                                        <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                            <div>Tiên hiệp, kiếm hiệp</div>
                                            <i className='bx bx-x'></i>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        

                        </div>
                        <div className="col-md-6">
                            {/* Description */}
                            <label>Mô tả sách</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text"
                                isMultiLine
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                            
                            {/* Language */}
                            <label>Ngôn ngữ</label>
                            <ValidatableInput 
                                pxWidth={200}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                        
                            {/* Price */}
                            <label>Giá bán</label>
                            <ValidatableInput 
                                pxWidth={200}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">

                        <Button label="Lưu" pxSize={16} pxWidth={100} blackTheme className="" onClick={() => {}}></Button>
                    </div>
                </>
            )}

            { status == Status.Update && (
                <>
                    <div className="d-flex my-2">
                        <Button label="Quay lại danh sách"
                            icon={<i className='bx bx-chevron-left'></i>} 
                            onClick={() => setStatus(Status.List)}></Button>
                    </div>
                    <h5 className="label">Cập nhật thông tin</h5>
                    <div className="row">
                        <div className="col-md-6">
                            {/* Name */}
                            <label >Tên sách</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    {/* Cover */}
                                    <label className="">Bìa sách</label>
                                    <div className=" text-center">
                                        <img src={testLogo} alt="" />
                                        <label className="upload-img mt-2 pointer-hover">
                                            Tải ảnh lên
                                            <input type="file" accept=".PNG, .JPG" hidden onChange={e => {}}/>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    {/* Author */}
                                    <label className="">Tên tác giả</label>
                                    <ValidatableInput
                                        isFormFocus={formFocus}
                                        type="text"
                                        valueChange={val => {}} 
                                        validator={val => {
                                            if (!val) return "Họ đệm không được bỏ trống";
                                            return null;
                                        }}/>

                                    {/* Categories */}
                                    <div className="d-flex">
                                        <label className="">Thể loại</label>
                                        <div className="flex-fill"></div>
                                        <a href="" className="text-decoration-none d-flex align-items-center" data-bs-toggle="dropdown">
                                            <i className='bx bx-plus'></i>
                                            <div>Thêm thể loại</div>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end rounded-0 py-0">
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                            <div className="dropdown-item" onClick={() => {}}>Quản trị</div>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column cate-list mt-2">
                                        <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                            <div>Tiên hiệp, kiếm hiệp</div>
                                            <i className='bx bx-x'></i>
                                        </div>

                                        <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                            <div>Tiên hiệp, kiếm hiệp</div>
                                            <i className='bx bx-x'></i>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        

                        </div>
                        <div className="col-md-6">
                            {/* Description */}
                            <label>Mô tả sách</label>
                            <ValidatableInput 
                                isFormFocus={formFocus}
                                type="text"
                                isMultiLine
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                            
                            {/* Language */}
                            <label>Ngôn ngữ</label>
                            <ValidatableInput 
                                pxWidth={200}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                        
                            {/* Price */}
                            <label>Giá bán</label>
                            <ValidatableInput 
                                pxWidth={200}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => {}} 
                                validator={val => {
                                    if (!val) return "Họ đệm không được bỏ trống";
                                    return null;
                                }}/>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">

                        <Button label="Lưu thay đổi" pxSize={16} pxWidth={100} blackTheme className="" onClick={() => {}}></Button>
                    </div>
                </>
            )}
        </div>
        
    );
}

export default ProductManagement;