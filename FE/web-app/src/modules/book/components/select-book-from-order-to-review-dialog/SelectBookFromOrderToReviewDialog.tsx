import React, { useEffect, useState } from "react";
import './SelectBookFromOrderToReviewDialog.css';
import { BookToReviewListItemDTO } from "../../types/book";
import { Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { getBooksInOrderApi } from "../../../payment";
import { BaseProp, Button } from "../../../shared";
import { useNavigate } from "react-router-dom";

type Prop = BaseProp & {
    orderId: string|null;
    open: boolean;
    onClose: () => void
}

const SelectBookFromOrderToReviewDialog = (prop: Prop) => {
    const nav = useNavigate();

    const [books, setBooks] = useState<BookToReviewListItemDTO[]>([]);
    const [selectedId, setSelectedId] = useState<string|null>(null);

    const getBooks = async () => {
        const res = await getBooksInOrderApi(prop.orderId!);
        if (res.isSuccess) {
            setBooks(res.data!);
        }
    }

    useEffect(() => {
        if (prop.orderId) getBooks();
    }, [prop.orderId]);

    if (!prop.orderId) return null;
    return (
        <Dialog 
            onClose={() => {}} open={prop.open}
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
        >
            <DialogTitle fontSize={16} textAlign={'center'}>Chọn sản phẩm đánh giá</DialogTitle>
            <DialogContent dividers>
                {books.length > 0 && <>
                    <RadioGroup
                        aria-label="books"
                        name="books"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        {books.map((e) => 
                            <FormControlLabel className="mb-3" value={e.bookId} control={<Radio/>} label={<>
                                <div className="d-flex">
                                    <img src={e.cover} alt="" width={50} height={50} className="object-fit-contain"/>
                                    <div className="d-flex flex-column ms-2">
                                        <h6 className="max-1-line">{e.bookName}</h6>
                                        <div className="d-flex">
                                            <label htmlFor="">Giá: <b>{e.price.toLocaleString('vn')}</b></label>
                                            <label className="ms-3">Số lượng: <b>{e.quantity}</b></label>
                                        </div>
                                    </div>
                                </div>
                            </>}/>
                        )}
                    </RadioGroup>
                </>}
                <div className='d-flex justify-content-center mt-3'>
                    <Button label='Hủy' className='me-2' onClick={prop.onClose}/>
                    <Button label='Đánh giá' blackTheme onClick={() => {
                        nav(`/account/review-book?id=${selectedId}`)
                    }}/>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SelectBookFromOrderToReviewDialog;