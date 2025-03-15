import React, { useEffect, useState } from "react";
import './AccountHistory.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "../../../../shared";
import { BookItem } from "../../../../book";

export const AccountHistory = () => {
    // Test
    const [page, setPage] = useState(1);
    const total = 15;
    const navigate = useNavigate();

    const [param, setSearchParams] = useSearchParams();
    const [type, setType] = useState(param.get('type'));
    const changeType = (type: string) => {
        setType(type);
        setSearchParams({ type: type }, { replace: true });
    } 
    useEffect(() => {
        if(!type) changeType('purchased');
    }, []);
    

    return (
        <div className="history">
            
            <div className="card card-body rounded-0 pt-1">
                {/* Navigation tab */}
                <div className="d-flex tab mb-2">
                    <div className={`tab-item px-3 py-1 ${type == 'purchased'? 'selected':''}`} 
                        onClick={() => changeType('purchased')}>Đã mua</div>

                    <div className={`tab-item px-3 py-1 ${type == 'payment'? 'selected':''}`} 
                        onClick={() => changeType('payment')}>Lịch sử thanh toán</div>
                </div>

                {/* Purchase */}
                { type == 'purchased' && (
                    <>
                        <div className="row">
                            {/* <BookItem className="col-3"/> */}
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-3">
                            <Pagination page={page} total={total} onPageChange={p => setPage(p)}/>
                        </div>
                    </>
                ) }

                {/* Payment */}
                <div className="d-flex flex-column">
                    


                </div>
            </div>
        </div>
    );
}
