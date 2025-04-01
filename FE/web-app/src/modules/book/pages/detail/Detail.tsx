import React, { useEffect, useState } from "react";
import "./Detail.css"
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { BookDetailDTO, BookItem, ReviewComment, useBook } from "../..";
import { AppDispatch, Button, defaultImageUrl, endLoadingStatus, OutletContextProp, showErrorToast, startLoadingStatus } from "../../../shared";
import { Rating } from "@mui/material";
import { useDispatch } from "react-redux";
import { useOrder } from "../../../payment";

const Detail = () => {
    const { apiLoading, getBookDetail } = useBook();
    const { orderApiLoading, createNewOrder } = useOrder();
    const navigate = useNavigate();

    const { isApiReady } = useOutletContext<OutletContextProp>();
    const [param] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    const [book, setBook] = useState<BookDetailDTO|null>(null);

    const init = async () => {
        const id = param.get('id');
        if (id) {
            setBook(await getBookDetail(id));
        } else {
            showErrorToast("Giá trị không hợp lệ");
        }
    }

    const buyBook = async () => {
        const orderId = await createNewOrder(book!.id);
        if (orderId) {
            navigate(`/order?id=${orderId}`);
        }
    }

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    useEffect(() => {
        if (apiLoading || orderApiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [apiLoading, orderApiLoading]);

    return (
        <div className="detail">
            { book && <>
                <div className="row mt-3">
                    {/* Content */}
                    <div className="col-9 mb-3 bg-white">
                        
                        <div className="row g-3 mb-3">
                            <div className="col-sm-4">
                                <img src={book.cover ?? defaultImageUrl} alt="" className="cover" />
                            </div>
                            <div className="col-sm-8">
                                <div className="d-flex flex-column h-100">
                                    {/* Name */}
                                    <h3 className="fw-bold">{book.name}</h3>
                                    {/* Author */}
                                    <div className="d-flex mt-2">
                                        <label>Tác giả:</label>
                                        <div className="ms-2">{book.author}</div>
                                    </div>
                                    {/* Category */}
                                    <div className="d-flex">
                                        <label className="flex-shrink-0">Thể loại:</label>
                                        <div className="ms-2">{book.categories.join(', ')}</div>
                                    </div>
                                    {/* PD */}
                                    <div className="d-flex">
                                        <label>Ngày xuất bản:</label>
                                        <div className="ms-2">{book.publishDate}</div>
                                    </div>
                                    {/* lang */}
                                    <div className="d-flex">
                                        <label>Ngôn ngữ:</label>
                                        <div className="ms-2">{book.language}</div>
                                    </div>
                                    {/* Price */}
                                    <div className="d-flex fw-bold" style={{fontSize: '28px'}}>
                                        <label>Giá:</label>
                                        <div className="ms-2">{book.price.toLocaleString('vi-VN')} {book.currency}</div>
                                    </div>

                                    <div className="d-flex mt-2">
                                        <div className="">Đã bán {book.soldCount}</div>
                                        <div className="ms-3">Còn lại 32.987</div>
                                    </div>

                                    <div className="d-flex">
                                        <label>Đánh giá:</label>
                                        <div className="ms-2">
                                            <Rating name="half-rating-read" defaultValue={book.avgRate} precision={0.5} readOnly />
                                        </div>
                                    </div>

                                    <div className="flex-fill"></div>

                                    <div className="d-flex">
                                        <Button label="Mua ngay" pxWidth={160} pxSize={16} blackTheme onClick={buyBook}/>
                                        <Button label="Thêm vào giỏ hàng" icon={<i className="fas fa-cart-plus"></i>} className="ms-2" pxWidth={160} pxSize={16} onClick={() => {}}/>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Intro */}
                        <h5 className="label mt-3">Mô tả</h5>
                        <p>{book.description}</p>

                        {/* Review */}
                        <div className="d-flex align-items-center mb-2 mt-3">
                            <h5 className="label">Đánh giá</h5>
                            <div className="flex-fill"></div>
                            <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả (560)</a>
                        </div>
                        <ReviewComment className="mb-3"/>
                        <ReviewComment className="mb-3"/>
                        <ReviewComment className="mb-3"/>

                    </div>

                    {/* Top seller */}
                    <div className="col-3 mb-3 bg-white">
                        <h5 className="label">Cùng thể loại</h5>
                    </div>

                    {/* Rela */}
                    <div className="col-12">
                        <div className="d-flex align-items-center">
                            <h5 className="label">Liên quan</h5>
                            <div className="flex-fill"></div>
                            <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả (560)</a>
                        </div>
                        <div className="scrollable horizontal-scrollable" style={{maxWidth: '100%'}}>
                            <div className="d-flex py-2">
                                {/* <BookItem className="col-3 me-1"/>
                                <BookItem className="col-3 me-1"/>
                                <BookItem className="col-3 me-1"/>
                                <BookItem className="col-3 me-1"/>
                                <BookItem className="col-3 me-1"/> */}
                            </div>
                        </div>
                    </div>
                </div>
            </> }
        </div>
    );
}

export default Detail;