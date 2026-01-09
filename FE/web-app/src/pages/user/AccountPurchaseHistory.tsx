import React, { useEffect, useState } from "react";
import '../../styles/pages/AccountPurchaseHistory.css';
import { useDispatch } from "react-redux";
import { startCase } from "lodash";
import { useOutletContext } from "react-router-dom";
import { AppDispatch, endLoadingStatus, startLoadingStatus } from "../../stores";
import { OutletContextProp } from "../../types/base";
import { BoughtBookListItemDTO } from "../../types/book";
import { getBoughtBooks } from "../../api";
import { showErrorToast } from "../../utils";
import { formatDate } from "../../utils/helper";
import { BookItem } from "../../components/BookItem";

export const AccountPurchaseHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [books, setBooks] = useState<BoughtBookListItemDTO[]>([]);
    const [days, setDays] = useState<Date[]>([]);

    const init = async () => {
        dispatch(startLoadingStatus())
        const res = await getBoughtBooks();
        if (res.isSuccess) {
            res.data!.forEach(e => e.lastPurchasedAt = new Date(e.lastPurchasedAt));
            setBooks(res.data!);
        }
        else {
            showErrorToast(res.message!);
        }
        dispatch(endLoadingStatus())
    }

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.toDateString() === date2.toDateString();
    };

    useEffect(() => {
        if (isApiReady) init();
    }, [isApiReady]);
    
    useEffect(() => {
        if (books.length > 0) {
            const uniqueDays = Array.from(
            new Set(
                books.map((book) =>
                    new Date(book.lastPurchasedAt).setHours(0, 0, 0, 0)
                )
            )
            ).map((timestamp) => new Date(timestamp));

            setDays(uniqueDays);
        }
    }, [books]);

    return (
        <div className="history">
            <h5>Lịch sử mua hàng</h5>
            <div className="mt-2">
                {days.map(day => <>
                    <label className="mb-2 fw-light">
                        <i className="far fa-calendar-alt me-2"></i>
                        {formatDate(day, 'dd/MM/yyyy')}
                    </label>
                    <div className="row g-3 mb-3">
                        {books.filter(e => isSameDay(e.lastPurchasedAt, day)).map(e => <>
                            <BookItem className="col-2" data={e}/>
                        </>)}
                    </div>
                </>)}
            </div>
        </div>
    );
}
