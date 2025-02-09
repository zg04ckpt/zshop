import React from "react";
import "./Pagination.css"
import { BaseProp } from "../../model/base-prop.model";

type PaginationProp = BaseProp & {
    page: number;
    total: number;
    onPageChange: (current: number) => void
}

const Pagination = (prop: PaginationProp) => {
    const onClick = (page: number) => prop.onPageChange(page);
    return (
        <div className={`pagination ${prop.className}`}>
            <div className="d-flex justify-content-center">
                {/* Prev page btn */}
                <a className={`page-link ${prop.page == 1 ? 'disabled':''}`} onClick={() => prop.onPageChange(prop.page - 1)}>
                    <i className='bx bx-chevron-left'></i>
                </a>

                {/* Pages btn */}
                <ul className="pagination d-flex justify-content-center mb-0" style={{width: '322px'}}>
                    <a className={`page-link ${prop.page == 1 ? 'current':''}`} onClick={() => prop.onPageChange(1)}>1</a>
                    { prop.page - 2 > 1 && <h5 className="p-0 align-items-center mx-2" style={{height: '36px'}}>. . .</h5> }
                    { prop.page > 2 && <a className="page-link" onClick={() => prop.onPageChange(prop.page - 1)}>{prop.page - 1}</a> }
                    { prop.page > 1 && prop.page < prop.total && <a className="page-link current" onClick={() => prop.onPageChange(prop.page)}>{prop.page}</a> }
                    { prop.page < prop.total - 1 && <a className="page-link" onClick={() => prop.onPageChange(prop.page + 1)}>{prop.page + 1}</a> }
                    { prop.page + 2 < prop.total && <h5 className="p-0 align-items-center mx-2" style={{height: '36px'}}>. . .</h5> }
                    { prop.total > 1 && <a className={`page-link ${prop.page == prop.total ? 'current':''}`} onClick={() => prop.onPageChange(prop.total)}>{prop.total}</a> }
                </ul>

                {/* Next page btn */}
                <a className={`page-link ${prop.page == prop.total ? 'disabled':''}`} onClick={() => prop.onPageChange(prop.page + 1)}>
                    <i className='bx bx-chevron-right'></i>
                </a>
            </div>
        </div>
    );
}

export default Pagination;