import React from "react";
import './Search.css';
import ProductItem from "../../components/product-item/ProductItem";
import { Link } from "react-router-dom";
import Button from "../../components/button/Button";
import ProductFilter from "../../components/product-filter/ProductFilter";

const Search = () => {
    const testData = []
    for (let i = 0; i < 50; i++) {
        testData.push(i)
    }

    return (
        <div className="row mt-3">
            {/* Left */}
            <div className="col-3">
                <ProductFilter/>
            </div>

            {/* Right */}
            <div className="col-9">
                <div className="row">
                    {
                        testData.map(e => (
                            <div className="col-sm-6 col-md-4 col-lg-3 px-1 mb-2" key={e}>
                                <ProductItem><Link to={'/detail'}></Link></ProductItem>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Search;