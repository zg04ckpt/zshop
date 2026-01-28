import React from "react";

export const About = () => {

    const features = [
        {
            title: "Quản lý sách",
            description: "Thêm, sửa, xóa sách với đầy đủ thông tin: tên, tác giả, mô tả, giá, hình ảnh",
            icon: "fas fa-book"
        },
        {
            title: "Giỏ hàng & Thanh toán",
            description: "Thêm sách vào giỏ hàng, áp dụng voucher, thanh toán và theo dõi đơn hàng",
            icon: "fas fa-shopping-cart"
        },
        {
            title: "Quản lý người dùng",
            description: "Đăng ký, đăng nhập, quản lý thông tin tài khoản, địa chỉ giao hàng",
            icon: "fas fa-users"
        },
        {
            title: "Đánh giá & Nhận xét",
            description: "Khách hàng có thể đánh giá và nhận xét sách sau khi mua",
            icon: "fas fa-star"
        },
        {
            title: "Chat hỗ trợ",
            description: "Hệ thống chat trực tuyến giữa khách hàng và admin",
            icon: "fas fa-comments"
        },
        {
            title: "Quản lý đơn hàng",
            description: "Cập nhật trạng thái đơn hàng, xem thông tin chi tiết",
            icon: "fas fa-chart-line"
        }
    ];

    const frontendTechnologies = [
        "React (TypeScript) - Thư viện xây dựng giao diện người dùng",
        "Redux Toolkit - Quản lý state toàn cục của ứng dụng",
        "Bootstrap 5 - Thư viện CSS để thiết kế responsive + làm đẹp UI",
        "Axios - Cơ sở các phương thức và lớp xử lý giao tiếp với Backend thông qua API",
        "React Router - Điều hướng trang trong ứng dụng",
        "CKEditor - Trình soạn thảo văn bản HTML",
        "Font Awesome - Thư viện icon",
        "Material UI - Thư viện UI cung cấp các component được xây dựng sẵn"
    ];

    const backendTechnologies = [
        "ASP.NET core (.NET 6) - Xây dựng ứng dụng cung cấp API phía máy chủ",
        "MySQL - Cơ sở dữ liệu cho website",
        "Cloudinary - Dịch vụ cloud quản lí các dữ liệu media",
        "JWT + Cookie - Cơ chế xác thực và phân quyền users",
        "Entity Framework Core - ORM framework",
        "Redis - Lưu trữ các thông tin truy xuất nhanh",
        "SignalR - Triển khai tính năng Chat hỗ trợ",
        "VNPay - Thanh toán online",
        "MailKit - Hỗ trợ gửi email tự động",
        "OAuth (Google) - Đăng nhập với tài khoản Google"
    ];

    const demos = [
        {
            id: "auth",
            title: "Đăng ký, Đăng nhập & Quản lý tài khoản",
            description: "Giao diện đăng ký, đăng nhập, cơ chế khóa đăng nhập, xác thực tài khoản với token, cập nhật thông tin tài khoản",
            video: "https://res.cloudinary.com/dvk5yt0oi/video/upload/v1769097923/2026-01-22_23-02-38_qsfs7c.mp4"
        },
        {
            id: "books",
            title: "Trang chủ, Tìm kiếm & Xem chi tiết",
            description: "Hiển thị gợi ý sách tại trang chủ, tìm kiếm và lọc sách theo tiêu chí, xem thông tin chi tiết về sách tương ứng",
            video: "https://res.cloudinary.com/dvk5yt0oi/video/upload/v1769484772/home_gmot55.mp4"
        },
        {
            id: "cart_payment",
            title: "Giỏ hàng, Thanh toán & Theo dõi đơn hàng",
            description: "Quản lý giỏ hàng, Áp dụng voucher giảm giá khi thanh toán, Theo dõi tiến độ đơn hàng, Quản lý đơn hàng",
            video: "https://res.cloudinary.com/dvk5yt0oi/video/upload/v1769484676/pay_com_dqoqch.mp4"
        },
        {
            id: "chat",
            title: "Chat hỗ trợ",
            description: "Tính năng chat trực tuyến giữa khách hàng và admin",
            video: "https://res.cloudinary.com/dvk5yt0oi/video/upload/v1769484631/chat_ykgvba.mp4"
        },
        {
            id: "review",
            title: "Đánh giá sản phẩm",
            description: "Khách hàng đánh giá và nhận xét sách sau khi mua",
            video: "https://res.cloudinary.com/dvk5yt0oi/video/upload/v1769484741/review_lul15d.mp4"
        }
    ];

    return (
        <div className="about">
            <div className="container py-5">
                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="fw-bold mb-3">ZShop - Phiên bản thử nghiệm 1.0</h1>
                    <h3 className="text-muted mb-3">Website bán sách</h3>
                    <p className="fst-italic">
                        Mọi nội dung dữ liệu trong trang web đều mang tính chất thử nghiệm, không có giá trị thực tế.
                    </p>
                    <h6>Tài khoản test: test@zshop.com|test</h6>
                </div>

                {/* Features Section */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4">
                        <i className="fas fa-list-check me-2"></i>
                        Tính năng chính
                    </h2>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm hover-shadow">
                                    <div className="card-body">
                                        <div className="text-center mb-3">
                                            <i className={`${feature.icon} fa-3x text-primary`}></i>
                                        </div>
                                        <h5 className="card-title text-center">{feature.title}</h5>
                                        <p className="card-text text-muted">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technologies Section */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4">
                        <i className="fas fa-code me-2"></i>
                        Công nghệ sử dụng
                    </h2>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h4 className="card-title text-primary mb-4">
                                        <i className="fas fa-desktop me-2"></i>
                                        Frontend
                                    </h4>
                                    <ul className="list-unstyled">
                                        {frontendTechnologies.map((tech, index) => (
                                            <li key={index} className="mb-3">
                                                <i className="fas fa-check-circle text-success me-2"></i>
                                                <span>{tech}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h4 className="card-title text-primary mb-4">
                                        <i className="fas fa-server me-2"></i>
                                        Backend
                                    </h4>
                                    <ul className="list-unstyled">
                                        {backendTechnologies.map((tech, index) => (
                                            <li key={index} className="mb-3">
                                                <i className="fas fa-check-circle text-success me-2"></i>
                                                <span>{tech}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Section */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4">
                        <i className="fas fa-video me-2"></i>
                        Demo tính năng
                    </h2>
                    <div className="row g-4">
                        {demos.map((demo) => (
                            <div key={demo.id} className="col-lg-6">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title mb-3">
                                            <i className="fas fa-play-circle me-2 text-primary"></i>
                                            {demo.title}
                                        </h5>
                                        <p className="card-text text-muted mb-3">{demo.description}</p>
                                        <div className="video-container">
                                            <video 
                                                className="w-100 rounded"
                                                controls
                                                preload="metadata"
                                                poster={`https://via.placeholder.com/640x360/0d6efd/ffffff?text=${encodeURIComponent(demo.title)}`}
                                            >
                                                <source 
                                                    src={demo.video} 
                                                    type="video/mp4"
                                                />
                                                Trình duyệt của bạn không hỗ trợ video HTML5.
                                            </video>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                
                <section className="text-center mt-5 pt-5 border-top">
                    <h3 className="mb-4">Liên hệ</h3>
                    <p>Mọi thắc mắc, vấn đề vui lòng liên hệ:</p>
                    <div className="d-flex flex-column align-items-center gap-2">
                        <h5>
                            <i className="far fa-envelope fs-4 me-2"></i>
                            dever.z.ckpt.526@gmail.com
                        </h5>
                        <h5>
                            <i className="fab fa-facebook-square fs-4 me-2"></i>
                            <a 
                                href="https://www.facebook.com/nguyenhc424"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://www.facebook.com/nguyenhc424
                            </a>
                        </h5>
                    </div>
                </section>
            </div>

            <style>{`
                .hover-shadow {
                    transition: all 0.3s ease;
                }
                .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                .video-container {
                    position: relative;
                    width: 100%;
                    background: #000;
                    border-radius: 0.375rem;
                    overflow: hidden;
                }
                .video-container video {
                    display: block;
                    max-height: 400px;
                    object-fit: contain;
                }
            `}</style>
        </div>
    );
}