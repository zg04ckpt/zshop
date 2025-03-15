import React from "react";
import "./Home.css"
import { defaultImageUrl, Header } from "../../../shared";
import { BookItem } from "../..";

const Home = () => {

    const testData = []
    for (let i = 0; i < 50; i++) {
        testData.push(i)
    }

    return (
        <div className="home col-lg-10 offset-lg-1">
            <Header/>

            {/* Category */}
            <h5 className="mt-3 ps-2 label fw-light">Danh mục</h5>
            <div className="scrollable pb-2 horizontal-scrollable w-100">
                <div className="d-flex">

                    {testData.map(e => (
                        <div className="d-flex flex-column align-items-center cate-item p-2">
                            <img src={defaultImageUrl} alt="" />
                            <div className=" fw-bold">Danh mục</div>
                        </div>
                    ))}

                </div>
            </div>
            

            {/* Top sell */}
            <h5 className="mt-3 ps-2 label fw-light">Bán chạy</h5>
            <div className="row g-2">
                {testData.map(e => (
                    <div className="col-2">
                        {/* <BookItem/> */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;