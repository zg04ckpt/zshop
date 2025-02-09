import React from "react";
import testLogo from "../../../assets/images/test-img.jpg";
import "./Detail.css"
import Button from "../../components/button/Button";
import ReviewComment from "../../components/review-comment/ReviewComment";
import ProductItem from "../../components/product-item/ProductItem";
import { useNavigate } from "react-router-dom";

const Detail = () => {
    const navigate = useNavigate();
    return (
        <div className="row mt-3">
           
           {/* Main info */}
            <div className="col-4">
                <div className="card card-body rounded-0 d-flex flex-column" style={{position: 'sticky', top: '70px'}}>
                    <h6 className="label">Thông tin cơ bản</h6>
                    {/* Content */}
                    <div className="row pt-2">
                        {/* Cover */}
                        <label className="col-4">Ảnh bìa:</label>
                        <div className="col-8 fw-bold">
                            <img src={testLogo} alt="" style={{height: '200px', objectFit: 'cover'}}/>
                        </div>

                        {/* Name */}
                        <label className="col-4">Tên đủ:</label>
                        <div className="col-8 fw-bold">Tuyển tập onepuchh man</div>

                        {/* Author */}
                        <label className="col-4">Tác giả:</label>
                        <div className="col-8 fw-bold">Hhoiang Cao Nguyenn</div>
                    
                        {/* Category */}
                        <label className="col-4">Thể loại:</label>
                        <div className="col-8 fw-bold">Managa, Tiểu thuyết</div>

                        {/* Name */}
                        <label className="col-4">Xuất bản:</label>
                        <div className="col-8 fw-bold">26/12/2023</div>

                        {/* Lang */}
                        <label className="col-4">Ngôn ngữ:</label>
                        <div className="col-8 fw-bold">Tieng Viet</div>
                    
                        {/* Price */}
                        <label className="col-4">Giá:</label>
                        <div className="col-8 price d-flex align-items-center">
                            <div className="origin-price">12.000</div>
                            <div className="discount-tag ms-1">-30%</div>
                            <div className="current-price ms-1">= 12.000</div>
                            <div className="ms-1 fw-bold" style={{fontSize: '10px'}}>VNĐ</div>
                        </div>
                    </div>

                    <div className="d-flex flex-row justify-content-center mt-3 mb-0">
                        <Button label="Mua ngay" onClick={() => navigate('/order')}></Button>
                        <i className='bx bx-cart-add add-to-cart-btn ms-2 px-1 align-content-center' title="Thêm vào giỏ hàng"></i>
                    </div>
                </div>
            </div>

            {/* Other info */}
            <div className="col-8 ps-0">
                {/* Content */}
                <div className="card card-body rounded-0 mb-5" style={{position: 'sticky', top: '70px'}}>
                    <div className="d-flex flex-column">
                        {/* Intro */}
                        <h6 className="label">Mô tả</h6>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Harum, optio suscipit nostrum a eos quasi numquam facere non modi autem distinctio quia quaerat pariatur voluptas, maiores neque quisquam totam excepturi.</p>

                        {/* Review */}
                        <div className="d-flex align-items-center">
                            <h6 className="label">Đánh giá</h6>
                            <div className="flex-fill"></div>
                            <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả (560)</a>
                        </div>
                        <div className="d-flex flex-column rate-comment">

                            <ReviewComment className="mb-3"/>
                            <ReviewComment className="mb-3"/>
                            <ReviewComment className="mb-3"/>

                        </div>

                        {/* Rela */}
                        <div className="d-flex align-items-center">
                            <h6 className="label">Liên quan</h6>
                            <div className="flex-fill"></div>
                            <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả (560)</a>
                        </div>
                        <div className="scrollable horizontal-scrollable" style={{maxWidth: '100%'}}>
                            <div className="d-flex py-2">
                                <ProductItem className="col-3 me-1"/>
                                <ProductItem className="col-3 me-1"/>
                                <ProductItem className="col-3 me-1"/>
                                <ProductItem className="col-3 me-1"/>
                                <ProductItem className="col-3 me-1"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Detail;