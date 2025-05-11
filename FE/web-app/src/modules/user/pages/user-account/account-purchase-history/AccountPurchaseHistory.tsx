import React, { useEffect, useState } from "react";
import './AccountPurchaseHistory.css';
import { useDispatch } from "react-redux";
import { AppDispatch, convertDates, endLoadingStatus, formatDate, OutletContextProp, showErrorToast, startLoadingStatus } from "../../../../shared";
import { BookItem, BoughtBookListItemDTO, getBoughtBooksApi } from "../../../../book";
import { startCase } from "lodash";
import { useOutletContext } from "react-router-dom";

export const AccountPurchaseHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [books, setBooks] = useState<BoughtBookListItemDTO[]>([]);
    const [days, setDays] = useState<Date[]>([]);

    const init = async () => {
        dispatch(startLoadingStatus())
        const res = await getBoughtBooksApi();
        if (res.isSuccess) {
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
                {/* <div className="w-100 d-flex justify-content-center mt-3">
                    <Pagination page={page} total={total} onPageChange={p => setPage(p)}/>
                </div> */}
            </div>
        </div>
    );
}
