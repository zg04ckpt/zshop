import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import './ReviewBook.css';
import { AppDispatch, defaultImageUrl, endLoadingStatus, showErrorToast, showSuccessToast, startLoadingStatus } from "../../../../shared";
import { Button, Rating } from "@mui/material";
import { BookDetailDTO, BookListItemDTO, createBookReviewApi, getBookDetailApi } from "../../../../book";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";

export const ReviewBook = () => {
    const [params, setParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    const [book, setBook] = useState<BookDetailDTO|null>(null);
    const [rating, setRating] = useState<number>(0);
    const [id, setId] = useState<string|null>(null);
    const [content, setContent] = useState<string>('');
    const [images, setImages] = useState<{
        id: number,
        file: File,
        previewUrl: string
    }[]>([]);
    const fileUploadInputRef = useRef<HTMLInputElement>(null);

    const getBookInfo = async () => {
        const bookId = params.get('id');
        if (bookId) {
            setId(bookId);
            dispatch(startLoadingStatus());
            const res = await getBookDetailApi(bookId);
            if (res.isSuccess) {
                setBook(res.data!);
            } else {
                showErrorToast(res.message!);
            }
            
            dispatch(endLoadingStatus());
        }
    }

    const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            if (images.length == 3) {
                showErrorToast('Đã đạt số lượng ảnh tối đa');
                return;
            }
            const fileReader = new FileReader();
            const file = e.target.files![0];
            fileReader.onload = () => setImages(prev => [
                ... prev,
                {
                    id: prev.length + 1,
                    file: file,
                    previewUrl: fileReader.result as string
                }
            ]);;
            fileReader.readAsDataURL(e.target.files![0]);
            e.target.value = '';
        } catch {
            showErrorToast('Tải file thất bại')
        }
    }

    const sendReview = async () => {
        dispatch(startLoadingStatus());
        const res = await createBookReviewApi({
            bookId: id!,
            content: content,
            images: images.map(e => e.file),
            rate: rating
        });
        console.log({
            bookId: id!,
            content: content,
            images: images.map(e => e.file),
            rate: rating
        });
        
        if (res.isSuccess) {
            showSuccessToast('Cảm ơn bạn đã đánh giá, chúc bạn thật nhiều sức khỏe và may mắn.');
            window.history.back();
        } else {
            showErrorToast(res.message!);
        }
        dispatch(endLoadingStatus());
    }

    useEffect(() => {
        getBookInfo();
    }, []);

    return (
        <div className="ReviewBook container-lg">
            <h5>Đánh giá sản phẩm sau khi mua hàng</h5>

            {book && <>
                <div className="card card-body col-lg-8 pt-2 mb-3">
                    <label htmlFor="" className="text-center">THÔNG TIN SẢN PHẨM</label>
                    <div className="d-flex mt-2">
                        <img src={book.cover} width={100} height={100} alt="" />
                        <div className="d-flex flex-column ms-3">
                            <h6>{book.name}</h6>
                            <label htmlFor="">Thể loại: <i>{book.categories.join(',')}</i></label>
                            <label htmlFor="">Nhà xuất bản: <i>{book.publisher}</i></label>
                            <label htmlFor="">Năm xuất bản: <i>{book.publishYear}</i></label>
                        </div>
                    </div>
                </div>
            </>}

            <div className="card card-body col-lg-8 pt-2">
                <label htmlFor="" className="text-center">NỘI DUNG ĐÁNH GIÁ</label>
                <div className="d-flex flex-column mt-2">
                    <textarea onChange={e => setContent(e.target.value)} className="form-control" id="" placeholder="Vui lòng nhập nội dung đánh giá"></textarea>
                    <div className="d-flex mt-2">
                        <input type="file" ref={fileUploadInputRef} onChange={e => handleUploadImage(e)} hidden accept=".png, .jpg"/>
                        <button className="bg-white rounded-1 border-1 me-2" onClick={() => fileUploadInputRef.current?.click()}>
                            <i className="fa-solid fa-image"></i> Thêm ảnh</button>
                        {/* <button className="bg-white rounded-1 border-1 me-3"><i className="fa-solid fa-video"></i> Thêm video</button> */}
                        <span><i className="text-secondary">(Chỉ được phép tải lên tối đa 3 ảnh định dạng PNG/JPG)</i></span>
                    </div>
                    <div className="d-flex mt-3">
                        {images.map(e => <>

                            <div className="review-item position-relative me-2">
                                <img src={e.previewUrl} className="rounded-2 shadow-sm"  width={120} height={120} alt="" />
                                <i className="fa-solid fa-xmark position-absolute top-0 m-1 end-0" onClick={() => {
                                    setImages(prev => {
                                        prev = prev.filter(i => i.id != e.id);
                                        return prev;
                                    });
                                }}></i>
                            </div>

                        </>)}

                    </div>
                    <div className="d-flex mt-3">
                        <label htmlFor="">Đánh giá chất lượng:</label>
                        <Rating name="no-value" className="ms-3" value={rating} onChange={(e, v) => setRating(v!)}/>
                    </div>
                </div>

                <div className="justify-content-center d-flex mt-3">
                    <Button variant="outlined" onClick={sendReview}>Gửi đánh giá</Button>
                </div>
            </div>
        </div>
    );
}