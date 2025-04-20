import React, { useEffect, useState } from "react";
import "./Home.css"
import { defaultImageUrl, Header } from "../../../shared";
import { BookItem, BookListItemDTO, CategoryListItemDTO, getNewestBook, getTopCateApi, getTopSellBook } from "../..";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const nav = useNavigate();

    const [trendBooks, setTrendBooks] = useState<BookListItemDTO[]>([]);
    const [newestBooks, setNewestBooks] = useState<BookListItemDTO[]>([]);
    const [topCategories, setTopCategories] = useState<CategoryListItemDTO[]>([]);

    const testData = []
    for (let i = 0; i < 12; i++) {
        testData.push(i)
    }

    const initTopCate = async () => {
        const res = await getTopCateApi();
        if (res.isSuccess) {
            setTopCategories(res.data!);
        }
    }

    const initTopSellBooks = async () => {
        const res = await getTopSellBook();
        if (res.isSuccess) {
            setTrendBooks(res.data!);
        }
    }

    const initNewestBooks = async () => {
        const res = await getNewestBook();
        if (res.isSuccess) {
            setNewestBooks(res.data!);
        }
    }

    useEffect(() => {
        initTopCate();
        initTopSellBooks();
        initNewestBooks();
    }, []);


    return (
        <div className="home container-lg">
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

export default Home;