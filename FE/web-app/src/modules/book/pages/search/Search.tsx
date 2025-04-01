import React, { useCallback, useEffect, useRef, useState } from "react";
import './Search.css';
import { BookFilter, BookItem, BookListItemDTO, CategorySelectItemDTO, useBook } from "../..";
import { Link, useOutletContext } from "react-router-dom";
import { AppDispatch, Button, endLoadingStatus, OutletContextProp, Pagination, scrollToObject, scrollToTop, startLoadingStatus } from "../../../shared";
import { Box, FormControlLabel, Radio, RadioGroup, Slider } from "@mui/material";
import { useDispatch } from "react-redux";
import { flushSync } from "react-dom";
import { debounce, throttle } from "lodash";

type CategoryCheckBoxSelectItem = CategorySelectItemDTO & {
    isChecked: boolean
}

const Search = () => {
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const { apiLoading, getBooksAsListItem, getCategoriesAsListItem } = useBook();
    const dispatch = useDispatch<AppDispatch>();

    const [priceRange, setPriceRange] = React.useState<number[]>([0, 100]);
    const [books, setBooks] = useState<BookListItemDTO[]>([]);
    const [minPrice, setMinPrice] = useState<number|null>(null);
    const [maxPrice, setMaxPrice] = useState<number|null>(null);
    const [name, setName] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('Name');
    const [order, setOrder] = useState<string>('asc');
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(20);
    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [categories, setCategories] = useState<CategoryCheckBoxSelectItem[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);

    // init cate list
    const initCate = async () => {
        const cateData = await getCategoriesAsListItem()
        setCategories(cateData.map(e => ({
            ... e,
            isChecked: false
        })));
    }

    // load from api
    const load = async () => {
        const res = await getBooksAsListItem({
            name, maxPrice, 
            minPrice, page, size, sortBy, order,
            categoryIds: categories
                .filter(e => e.isChecked)
                .map(e => e.id)
        });
        if (res) {
            setTotalPage(res.totalPage);
            setTotalRecord(res.totalRecord);
            setBooks(res.data)
            scrollToTop();
            if (categories.length == 0) initCate();
        }
    }
    
    const reset = () => {
        flushSync(() => {
            setName("");
            setMinPrice(null);
            setMaxPrice(null);
            setOrder("asc");
            setSortBy("name");
            setPage(1);
            setPriceRange([0, 100]);
            setCategories((prev) => prev.map((e) => ({ ...e, isChecked: false })));
        });
    };

    // change type of sorting
    const handleChangeSortOption = (opt: string) => {
        var opts = opt.split('-');
        setOrder(opts[1]);
        setSortBy(opts[0])
    }

    // change on select category
    const handleOnClickCateItem = (cateId: number, isChecked: boolean) => {
        setCategories(prev => prev.map(e => 
            e.id == cateId? {... e, isChecked: !isChecked} : e
        ));
    }

    const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as number[]);
    };

    // set loading state
    useEffect(() => {
        if (apiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [apiLoading]);

    // auto search
    useEffect(() => {
        if(isApiReady) load();
    }, [page, isApiReady, name, minPrice, maxPrice, order, sortBy, categories]);

    // delay update for slider
    const updatePrices = useCallback(
        debounce(() => {
            setMinPrice(priceRange[0] / 100.0 * 1000000);
            setMaxPrice(priceRange[1] / 100.0 * 1000000);
        }, 500), 
        [priceRange] 
    );
    useEffect(() => {
        updatePrices();
        return () => updatePrices.cancel();
    }, [priceRange]);

    return (
        <div className="row mt-3 search">
            {/* Filter */}
            <div className="col-3">
                <div className="d-flex flex-column">
                    <div className="label mb-2">Danh mục</div>
                    <div className="scrollable vertical-scrollable" style={{maxHeight: '200px'}}>
                        <div className="d-flex flex-column">
                            {
                                categories.map(e => (
                                    <div className="d-flex py-1 cate-item align-items-center ps-2">
                                        <input type="checkbox" className="me-1" checked={e.isChecked} onClick={() => handleOnClickCateItem(e.id, e.isChecked)}/>
                                        <div className="ms-2 max-1-line">{e.name}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div> 

                    {/* Giá */}
                    <div className="label my-2">Giá</div>
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-2">
                            <div className="flex-shrink-0 ms-1">Thấp nhất</div>
                            <div className="flex-fill"></div>
                            <input className="fw-bolder" value={minPrice ?? ''} inputMode="decimal" max="10000000" step="100000" min="0" type="number" style={{width: '140px'}}/>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <div className="flex-shrink-0 ms-1">Cao nhất</div>
                            <div className="flex-fill"></div>
                            <input className="fw-bolder" value={maxPrice ?? ''} step="100000" min="0" max="10000000" type="number" style={{width: '140px'}}/>
                        </div>

                        <Slider
                            value={priceRange}
                            onChange={handlePriceRangeChange}
                            valueLabelDisplay="off"
                        />
                    </div>
        
                    {/* Sort */}
                    <div className="label my-2">Sắp xếp theo</div>
                    <RadioGroup
                        value={sortBy + '-' + order}
                        onChange={e => handleChangeSortOption(e.currentTarget.value)}
                    >
                        <FormControlLabel value="name-asc" control={<Radio size="small"/>} label="Tên A-Z" />
                        <FormControlLabel value="name-desc" control={<Radio size="small"/>} label="Tên Z-A" />
                        <FormControlLabel value="createdAt-desc" control={<Radio size="small"/>} label="Mới nhất" />
                        <FormControlLabel value="price-asc" control={<Radio  size="small"/>} label="Rẻ nhất" />
                        <FormControlLabel value="price-desc" control={<Radio  size="small"/>} label="Đắt nhất" />
                    </RadioGroup>

                    <div className="d-flex mt-2 justify-content-center">
                        <Button pxWidth={100} label="Làm mới" className="ms-2" onClick={reset}/>
                        <Button pxWidth={100} label="Lọc" className="ms-2" blackTheme onClick={load}/>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="col-9">
                <div className="d-flex">
                    <label className="me-2">Hiển thị {totalRecord} kết quả</label>
                    { name && <>
                        <Button label={`Từ khóa: ${name}`} pxSize={13} icon={<i className='bx bx-x fs-5'></i>} onClick={() => setName('')}/>
                    </> }
                    <div className="flex-fill"></div>
                    <Button label="Tìm kiếm" pxWidth={80} pxSize={14} pxHeight={30} blackTheme onClick={() => {
                        setName(nameRef.current!.value);
                        nameRef.current!.value = '';
                    }}/>
                    <input ref={nameRef} type="text" style={{fontSize: '14px', width: '300px'}} className="ms-2 px-1 py-1 text-secondary" placeholder="Nhập tên sách ..."/>
                </div>
                
                <div id="list" className="row g-2 mt-1">
                    { books.length == 0 && <div className="text-center fst-italic">-- Dữ liệu trống ---</div> }
                    {
                        books.map(e => (
                            <div className="col-sm-6 col-md-4 col-lg-3">
                                <BookItem data={e}></BookItem>
                            </div>
                        ))
                    }
                </div>

                <div className="d-flex justify-content-center mt-3">
                    <Pagination className="my-3" page={page} total={totalPage} onPageChange={p => {
                        setPage(p);
                    }}/>
                </div>
            </div>
        </div>
    );
}

export default Search;