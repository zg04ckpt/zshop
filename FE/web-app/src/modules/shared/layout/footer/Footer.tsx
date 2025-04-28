import React from "react";
import band from "../../../../assets/images/band.png";

export const Footer = () => {
    return (
        <footer className="card card-body rounded-0 shadow-sm mt-5">
            <div className="container-md">
                <div className="row bg-white">
                    <div className="col-lg-3">
                        <a href="/" className="m-3 pb-4">
                            <img src={band} alt="logo" className="img-fluid w-100" />
                        </a>
                        <p><i className="fa-solid fa-location-dot"></i> Lầu 5, 387-389 Hai Bà Trưng Quận 3 TP HCM</p>
                        <img height={40} src="https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744461125/zshop/images/pstr67owkso7q9fdctbd.webp" alt="" />
                        <div className="flex mt-2">
                            <img className="me-2" height={40} src="https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744461126/zshop/images/u5tobol2vhawtudvzdjv.webp" alt="" />
                            <img height={40} src="https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744461125/zshop/images/qxa7kyaaabvsqewm4vvw.webp" alt="" />
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <h5>Bản đồ</h5>
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2936395120764!2d106.6850735746274!3d10.78880738936075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2d5c09825b%3A0x6f527ddc175d177!2zNDc1L0hhaSBCw6AgVHLGsG5nLzUgMzUsIEtodSBwaOG7kSAzLCBRdeG6rW4gMywgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1744463022938!5m2!1sen!2s" 
                        height={200} className="w-100"  style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>

                    <div className="col-lg-3">
                        <h5>Chính sách dịch vụ</h5>
                        <div className="d-flex flex-column">
                            <a href="" className="link-dark text-decoration-none fs-6 fw-light">Điều khoản sử dụng</a>
                            <a href="" className="link-dark text-decoration-none fs-6 fw-light">Chính sách bảo mật</a>
                            <a href="" className="link-dark text-decoration-none fs-6 fw-light">Chính sách đổi trả</a>
                        </div>

                        <h5 className="mt-2">Chương trình khuyến mại</h5>
                        <div className="d-flex flex-column">
                            <a href="" className="link-dark text-decoration-none fs-6 fw-light">Mã giảm giá</a>
                            <a href="" className="link-dark text-decoration-none fs-6 fw-light">Top sale</a>
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <h5>Liên hệ</h5>
                        <div className="d-flex flex-column">
                            <label ><i className="fa-solid fa-headset"></i> 1900 1522</label>
                            <label ><i className="fa-solid fa-envelope"></i> cskh@zshop.com.vn</label>
                            <div className="d-flex mt-3">
                                <i className="fa-brands fa-facebook me-2 fs-3"></i>
                                <i className="fa-brands fa-square-instagram me-2  fs-3"></i>
                                <i className="fa-brands fa-tiktok me-2 fs-3"></i>
                                <i className="fa-brands fa-twitter me-2 fs-3"></i>
                                <i className="fa-brands fa-youtube me-2 fs-3"></i>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center">
                        <p className="mb-0 mt-1 text-secondary">Phiên bản thử nghiệm 1.0 - 25/04/2025</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}