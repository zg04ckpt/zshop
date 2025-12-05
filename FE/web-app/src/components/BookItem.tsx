import React from "react";
import "../styles/components/BookItem.css";
import { useNavigate } from "react-router-dom";
import { BaseProp } from "../types/base";
import { BookListItemDTO } from "../types/book";
import { defaultImageUrl } from "../utils/helper";

type BookItemProp = BaseProp & {
    data: BookListItemDTO
} 

export const BookItem = (prop: BookItemProp) => {
    const navigate = useNavigate();

    return (
        <div className={prop.className}>
            <div className="prod card card-body position-relative rounded-0 d-flex p-2 flex-column" onClick={() => navigate(`/book?id=${prop.data.id}`)}>
                <img className="prod-img" src={prop.data.cover ?? defaultImageUrl} alt="" />
                <p className="prod-cate text-center mb-0 mt-1 max-1-line">{prop.data.categories.join(',')}</p>
                <div className="d-flex align-items-center">
                    <div className="prod-price align-items-center d-flex">
                        {/* <div className="me-2 text-secondary text-decoration-line-through fs-6">{prop.data.price.toLocaleString('vn')}</div> */}
                        {prop.data.price.toLocaleString('vn')}
                    </div>
                    <b className="currency ms-1 text-secondary">{prop.data.currency}</b>
                </div>
                <div className="prod-name mb-0">{prop.data.name}</div>
                <div className="d-flex flex-row mt-1">
                    <div className="prod-rate">{prop.data.avgRate} <i className='bx bxs-star'></i></div>
                    <div className="flex-fill"></div>
                    <div className="prod-sell">Đã bán {prop.data.soldCount}</div>
                </div>
            </div>
        </div>
    );
}