import React, { useEffect, useState } from "react";
import "../../styles/pages/Home.css"
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
    BookListItemDTO, CategoryListItemDTO 
} from "../../types/book";
import { getNewestBooks, getTopCategories, getTopSellBooks } from "../../api";
import { Header } from "../../layout/Header";
import { BookItem } from "../../components/BookItem";
import { DiscountType, VoucherDetailDTO, VoucherStatus } from "../../types/voucher";
import { getVouchers } from "../../api/voucher";
import { showInfoToast } from "../../utils";

export const Home = () => {
    const nav = useNavigate();

    const [trendBooks, setTrendBooks] = useState<BookListItemDTO[]>([]);
    const [newestBooks, setNewestBooks] = useState<BookListItemDTO[]>([]);
    const [topCategories, setTopCategories] = useState<CategoryListItemDTO[]>([]);
    const [vouchers, setVouchers] = useState<VoucherDetailDTO[]>([]);

    const initTopCate = async () => {
        const res = await getTopCategories();
        if (res.isSuccess) {
            setTopCategories(res.data!);
        }
    }

    const initTopSellBooks = async () => {
        const res = await getTopSellBooks();
        if (res.isSuccess) {
            setTrendBooks(res.data!);
        }
    }

    const initNewestBooks = async () => {
        const res = await getNewestBooks();
        if (res.isSuccess) {
            setNewestBooks(res.data!);
        }
    }

    const initVouchers = async () => {
        const res = await getVouchers({
            code: null,
            name: null,
            start: null,
            end: null,
            pageIndex: 1,
            pageSize: 6
        });
        if (res.isSuccess) {
            setVouchers(res.data!.items);
        }
    }

    useEffect(() => {
        initTopCate();
        initTopSellBooks();
        initNewestBooks();
        initVouchers();
    }, []);

    const useNow = (tickMs = 1000) => {
        const [now, setNow] = useState(() => Date.now());

        useEffect(() => {
            const id = setInterval(() => {
                setNow(Date.now())
            }, tickMs);

            return () => clearInterval(id);
        }, [tickMs]);

        return now;
    }

    const getRemainingTime = (endUtc: Date, nowMs: number) => {
        const end = new Date(endUtc).getTime();
        const diff = Math.max(0, end - nowMs);

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { diff, days, hours, minutes, seconds };
    }

    const VoucherCountdown = ({voucher}: {voucher: VoucherDetailDTO}) => {
        const now = useNow();

        const { diff, days, hours, minutes, seconds } =
            getRemainingTime(voucher.status == VoucherStatus.Created? 
                voucher.validFrom : voucher.validUntil, now);

        if (diff <= 0) {
            if (voucher.status == VoucherStatus.Created) {
                return <span className="expired">Đã có hiệu lực</span>;
            }
            return <span className="expired">Đã hết hạn</span>;
        }

        return (
            <span className={`countdown ${voucher.status == VoucherStatus.Effective? 'text-success fw-bold':''}`}>
                {voucher.status == VoucherStatus.Created? 'Hiệu lực sau ':'Hết hạn sau '}
                {days > 0 && `${days}d `}
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
            </span>
        );
    }


    return (
        <div className="home">
            <Header/>

            {/* Category */}
            <div className="card card-body p-3 bg-white">
                <h5 className="fw-light"><i className="fas fa-tasks me-2"></i>Danh mục nổi bật</h5>
                <div className="row mb-3 g-0">
                    {topCategories.map(e => (
                        <div className="col-2">
                            <div className="d-flex flex-column align-items-center cate-item p-2" onClick={() => {
                                nav(`/search?cate=${e.id}`)
                            }}>
                                <img src={e.thumbnail} alt="" />
                                <div className="">{e.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vouchers */}
            <section className="mb-3">
                <h5 className="mt-3 fw-light"><i className="fa-solid fa-tags"></i> Voucher giảm giá</h5>
                <div className="row g-4">
                    {vouchers.map(e => <>
                        <div className="col-4">
                            <div className={`coupon ${e.status == VoucherStatus.Effective? 'active': 
                                                        e.status == VoucherStatus.Created? 'wait' : 
                                                        e.status == VoucherStatus.Expired? 'end':''}`}>
                                <div className="left">
                                    <div>Voucher giảm giá</div>
                                </div>
                                <div className="center">
                                    <div className="d-flex flex-column">
                                        <h3 className="fw-bold">{e.name}</h3>

                                        <h2>
                                            {
                                                e.discountType == DiscountType.Amount? 
                                                    `${e.discount.toLocaleString()} VNĐ`:
                                                    `${e.discount}%`
                                            }
                                        </h2>

                                        <small className="fst-italic">
                                            {
                                                `Số lượng còn lại: ${e.remainingQuantity}`
                                            }
                                        </small>
                                        
                                        <VoucherCountdown voucher={e}/>
                                    </div>
                                </div>
                                
                                <div className="right">
                                </div>
                                
                                </div>
                        </div>
                    </>)}
                </div>
                <div className="d-flex justify-content-center mt-3">
                    <Button variant="outlined" onClick={() => {
                        showInfoToast('Tính năng chưa phát triển!')
                    }}>Xem tất cả</Button>
                </div>
            </section>

            {/* Top sell */}
            <section className="top-sell">
                <h5 className="mt-3 fw-light"><i className="fab fa-free-code-camp me-2"></i>Xu hướng</h5>
                <div className="row g-2">
                    {trendBooks.map(e => (
                        <div className="col-2">
                            <BookItem data={e}></BookItem>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center mt-3">
                    <Button variant="outlined" onClick={() => {
                        nav(`/search?type=top-sell`)
                    }}>Xem tất cả</Button>
                </div>
            </section>

            {/* New */}
            <section className="new">
                <h5 className="mt-3 fw-light"><i className="fab fa-free-code-camp me-2"></i>Mới cập nhật</h5>
                <div className="row g-2">
                    {newestBooks.map(e => (
                        <div className="col-2">
                            <BookItem data={e}></BookItem>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center mt-3">
                    <Button variant="outlined" onClick={() => {
                        nav(`/search?type=newest`)
                    }}>Xem tất cả</Button>
                </div>
            </section>
        </div>
    );
}
