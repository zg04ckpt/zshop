import React from "react";
import ProductItem from "../../components/product-item/ProductItem.component";
import Button from "../../components/button/Button.component";
import { Link } from "react-router-dom";
import { Header } from "../../layout/header/Header";
import logo from "../../assets/images/test-img.jpg"
import "./Home.css"

const Home = () => {

    const testData = []
    for (let i = 0; i < 50; i++) {
        testData.push(i)
    }

    return (
        <div className="home col-12">
            <Header/>

            {/* Category */}
            <h5 className="mt-3 ps-2 label">Danh mục</h5>
            <div className="card card-body rounded-0 p-2">
                <div className="scrollable pb-2 px-2 pt-3 horizontal-scrollable w-100">
                    <div className="d-flex">

                        {testData.map(e => (
                            <div className="d-flex flex-column align-items-center cate-item me-3">
                                <img src={logo} alt="" />
                                <div>Danh mục</div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* Top sell */}
            <h5 className="mt-3 ps-2 label">Bán chạy</h5>
            <div className="row g-2">
                {testData.map(e => (
                    <div className="col-2">
                        <ProductItem/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;