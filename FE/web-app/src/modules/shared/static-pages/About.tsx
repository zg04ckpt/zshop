import React from "react";

const About = () => {
    return (
        <div className="about vh-100">
            <div className="mt-5 d-flex flex-column align-items-center">
                <h1 className="fw-bold">ZShop - Phiên bản thử nghiệm 1.0</h1>
                <h3>Website bán sách</h3>
                <p className="fst-italic">Mọi nội dung dữ liệu trong trang web đều mang tính chất thử nghiệm, không có giá trị thực tế.</p>
                <p>Mọi thắc mắc, vấn đề vui lòng liên hệ:</p>
                <h5><i className="far fa-envelope fs-4"></i> dever.z.ckpt.526@gmail.com</h5>
                <h5><i className="fab fa-facebook-square fs-4"></i> <a href="https://www.facebook.com/nguyenhc424">https://www.facebook.com/nguyenhc424</a></h5>
            </div>
        </div>
    );
}

export default About;