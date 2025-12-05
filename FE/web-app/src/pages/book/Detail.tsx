import React, { useEffect, useState } from "react";
import "../../styles/pages/Detail.css"
import { Await, useLocation, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { Rating } from "@mui/material";
import { useDispatch } from "react-redux";
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoSlider } from "react-photo-view";
import { OutletContextProp } from "../../types/base";
import { AppDispatch, endLoadingStatus, startLoadingStatus } from "../../stores";
import { BookDetailDTO, BookListItemDTO, BookReviewListItemDTO } from "../../types/book";
import { addBookToCart, createOrder, getBookDetail, getBookReviews, getRandomBooks, getTopSellBooks, payOrder } from "../../api";
import { showErrorToast, showSuccessToast } from "../../utils";
import { defaultImageUrl } from "../../utils/helper";
import Button from "../../components/Button";
import ReviewComment from "../../components/ReviewComment";
import { BookItem } from "../../components/BookItem";

export const Detail = () => {
    const navigate = useNavigate();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const [param] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const bookId = param.get('id');

    const [book, setBook] = useState<BookDetailDTO|null>(null);
    const [isShowImagePrevew, setIsShowImagePrevew] = useState<boolean>(false);
    const [imageIndex, setImageIndex] = useState<number>(0);
    const [reviews, setReviews] = useState<BookReviewListItemDTO[]>([]);
    const [topSellBooks, setTopSellBooks] = useState<BookListItemDTO[]>([]);
    const [randomBooks, setRandomBooks] = useState<BookListItemDTO[]>([]);

    const init = async () => {
        setBook((await getBookDetail(bookId!)).data!);
    }

    const initTopSell = async () => {
        const res = await getTopSellBooks();
        if (res.isSuccess) {
            setTopSellBooks(res.data!);
        }
    }

    const initRandom = async () => {
        const res = await getRandomBooks();
        if (res.isSuccess) {
            setRandomBooks(res.data!);
        }
    }

    const initReviews = async () => {
        const res = await getBookReviews(book!.id, 1, 10);
        if (res.isSuccess) {
            setReviews(res.data!);
        }
    }

    const buyBook = async () => {
        dispatch(startLoadingStatus());
        const res = await createOrder(book!.id);
        if (res.isSuccess) {
            navigate(`/order?id=${res.data!}`);
        }
        dispatch(endLoadingStatus());
    }

    const addToCart = async (bookId: string) => {
        dispatch(startLoadingStatus());
        
        const res = await addBookToCart(bookId);
        if (res.isSuccess) {
            showSuccessToast(res.message!);
        } else {
            showErrorToast(res.message!);
        }

        dispatch(endLoadingStatus());
    }

    const onBookImageClick = (key: number) => {
        setImageIndex(key);
        setIsShowImagePrevew(true);
    }

    useEffect(() => {
        if(isApiReady && bookId) {
            init();
            initRandom();
            initTopSell();
        }
    }, [isApiReady, bookId]);

    // useEffect(() => {
    //     if (apiLoading || orderApiLoading) {
    //         dispatch(startLoadingStatus());
    //     }
    //     else dispatch(endLoadingStatus());
    // }, [apiLoading]);

    useEffect(() => {
        if (book) initReviews();
    }, [book]);

    return (
        <div className="detail container-lg">
            { book && <>
                <div className="row mt-3 g-2">
                    {/* Content */}
                    <div className="col-9 mb-3">
                        
                        <div className="card card-body shadow-sm px-4"> 
                            <div className="row g-3 mb-3">
                                {/* Images */}
                                <div className="col-sm-4">
                                    <img onClick={() => onBookImageClick(0)} src={book.cover ?? defaultImageUrl} alt="" height={300} className="w-100 object-fit-cover" />
                                    
                                    <div className="d-flex flex-row justify-content-around mt-2">
                                        {book.images.slice(0, 2).map((e, i) => <>
                                            <img onClick={() => onBookImageClick(i+1)} src={e.imageUrl} alt="" height={80} width={80} 
                                                className="image-item object-fit-cover rounded-2" />
                                        </>)}
                                        <div onClick={() => onBookImageClick(3)} className="position-relative view-more ">
                                            <img src={book.images[2].imageUrl} alt="" height={80} width={80} 
                                                className="image-item object-fit-cover rounded-2" />
                                            {book.images.length > 3 && <>
                                                <div className="w-100 h-100 cover text-center rounded-2 position-absolute align-content-center top-0 start-0"
                                                    title={`Xem thêm ${book.images.length-3} ảnh nữa`}>
                                                    <div className="h3">+{book.images.length-3}</div>
                                                </div>
                                            </>}
                                        </div>
                                    </div>
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
                                            <label>Năm xuất bản:</label>
                                            <div className="ms-2">{book.publishYear}</div>
                                        </div>
                                        {/* Publisher */}
                                        <div className="d-flex">
                                            <label>Nhà xuất bản:</label>
                                            <div className="ms-2">{book.publisher}</div>
                                        </div>
                                        {/* PageCount */}
                                        <div className="d-flex">
                                            <label>Số trang:</label>
                                            <div className="ms-2">{book.pageCount}</div>
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
                                            <div className="ms-3">Còn lại {book.stockCount.toLocaleString('vn')}</div>
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
                                            <Button label="Thêm vào giỏ hàng" icon={<i className="fas fa-cart-plus"></i>} className="ms-2" 
                                                pxWidth={160} pxSize={16} onClick={() => addToCart(book.id)}/>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Intro */}
                            <h5 className="label mt-3">Mô tả</h5>
                            <div dangerouslySetInnerHTML={{ __html: book.description }} />

                            {/* Review */}
                            <div className="d-flex align-items-center mb-2 mt-3">
                                <h5 className="label">Đánh giá</h5>
                                <div className="flex-fill"></div>
                                <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả</a>
                            </div>
                            {reviews.map(e => <>
                                <ReviewComment data={e} className="mb-3"/>
                            </>)}
                            {reviews.length == 0 && <>
                                <p className="fst-italic text-center text-secondary">Chưa có nhận xét nào</p>
                            </>}
                        </div>
                        

                    </div>

                    {/* Top seller */}
                    <div className="col-3 mb-3">
                        <div className="card card-body shadow-sm p-0 pb-1">
                            <h6 className="label m-2">Bán chạy</h6>
                            <div className="d-flex flex-column px-1">
                                {topSellBooks.map(e => <>
                                    <div className="d-flex book-item p-2" onClick={() => navigate(`/book?id=${e.id}`)}>
                                        <img src={e.cover} width={50} height={50} alt="" />
                                        <div className="d-flex flex-column ms-2 ">
                                            <small className="max-1-line">{e.name}</small>
                                            <b>{e.price.toLocaleString('vn')} VNĐ</b>
                                        </div>
                                    </div>
                                </>)}
                            </div>  
                        </div>
                    </div>

                    {/* Rela */}
                    <div className="col-12">
                        <div className="d-flex align-items-center">
                            <h5 className="label">Khám phá</h5>
                            <div className="flex-fill"></div>
                            <a className="action-text fst-italic text-decoration-underline" style={{fontSize: '14px'}}>Xem tất cả (560)</a>
                        </div>
                        <div className="scrollable horizontal-scrollable" style={{maxWidth: '100%'}}>
                            <div className="row g-2 py-2">
                                {randomBooks.map(e => <>
                                    <BookItem className="col-2" data={e}/>
                                </>)}
                            </div>
                        </div>
                    </div>
                </div>
            </> }

            {book && <>
                <PhotoSlider
                    images={[
                        { src: book.cover, key: 0 },
                        ...book.images.map((item, order) => ({ src: item.imageUrl, key: order+1 })),
                    ]}
                    visible={isShowImagePrevew}
                    onClose={() => setIsShowImagePrevew(false)}
                    index={imageIndex}
                    onIndexChange={setImageIndex}/>
            </>}
        </div>
    );
}
