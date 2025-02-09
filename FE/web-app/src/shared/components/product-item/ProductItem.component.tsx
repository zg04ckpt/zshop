import React from "react";
import Button from "../button/Button.component";
import testImg from "../../../assets/images/test-img.jpg"
import "./ProductItem.component.css"
import { useNavigate } from "react-router-dom";
import { BaseProp } from "../../model/base-prop.model";

type ProductItemProp = BaseProp & {

} 

const ProductItem = (prop: ProductItemProp) => {
    const navigate = useNavigate();

    return (
        <div className={prop.className}>
            <div className="prod card card-body rounded-0 d-flex p-2 flex-column" onClick={() => navigate('/detail')}>
                <img className="prod-img" src={testImg} alt="" />
                <p className="prod-cate mb-0 mt-1">Managa, Hành động</p>
                <div className="prod-name mt-1 mb-0">Tên sách Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur modi nulla sit temporibus. Eligendi, omnis. Voluptatibus alias consectetur nemo itaque asperiores quidem quia eius explicabo doloribus ab? Maiores, saepe commodi!</div>
                <div className="prod-price">Giá <b>12.000 VNĐ</b></div>
                <div className="d-flex flex-row mt-1">
                    <div className="prod-rate">4.5 <i className='bx bxs-star'></i></div>
                    <div className="flex-fill"></div>
                    <div className="prod-sell">Đã bán 3k2</div>
                </div>
                
            </div>
        </div>
    );
}

export default ProductItem;