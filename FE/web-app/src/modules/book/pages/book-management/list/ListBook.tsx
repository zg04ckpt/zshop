import React, { ChangeEvent, useEffect, useState } from "react";
import './ListBook.css';
import { BookDetailDTO, BookDTO, BookListItemDTO, CategorySelectItemDTO, getBooksAsListManagementApi, useBook } from "../../..";
import { Button, dateToInputValue, defaultImageUrl, convertDateToTimeSpan, Loading, OutletContextProp, Pagination, scrollToObject, showErrorToast, showInfoToast, useAppContext, ValidatableInput } from "../../../../shared";
import { useNavigate, useOutletContext } from "react-router-dom";

type CategoryCheckBoxSelectItem = CategorySelectItemDTO & {
    isChecked: boolean
}

export const ListBook = () => {
    const appContext = useAppContext();
    const navigate = useNavigate();
    const { apiLoading, getBooksAsListItem, removeBook, getCategoriesAsListItem, updateBook } = useBook();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [books, setBooks] = useState<BookListItemDTO[]>([]);
    const [name, setName] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number|null>(null);
    const [maxPrice, setMaxPrice] = useState<number|null>(null);
    const [sortBy, setSortBy] = useState<string>('Name');
    const [order, setOrder] = useState<string>('asc');
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(20);
    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [categories, setCategories] = useState<CategoryCheckBoxSelectItem[]>([]);
    const [stock, setStock] = useState<number>(0);

    const init = async () => {
        const cateData = await getCategoriesAsListItem()
        setCategories(cateData.map(e => ({
            ... e,
            isChecked: false
        })));
    }

    const load = async () => {
        const res = await getBooksAsListManagementApi({
            name, maxPrice, minPrice, page, size, sortBy, order,
            categoryIds: categories
                .filter(e => e.isChecked)
                .map(e => e.id)
        });
        if (res.isSuccess) {
            setTotalPage(res.data!.totalPage);
            setTotalRecord(res.data!.totalRecord);
            setBooks(res.data!.data)
        }
    }

    const reset = () => {
        setName('');
        setMinPrice(null);
        setMaxPrice(null);
        setOrder('asc');
        setSortBy('name');
        setCategoryIds([]);
        setOrder('asc');
        setPage(1);
        setCategories(prev => prev.map(e => ({... e, isChecked: false})));
    }

    const handleChangeSortOption = (opt: string) => {
        var opts = opt.split('-');
        setOrder(opts[1]);
        setSortBy(opts[0])
    }

    const handleOnClickCateItem = (cateId: number) => {
        setCategories(prev => prev.map(e => 
            e.id == cateId? {... e, isChecked: !e.isChecked} : e
        ));
    }

    const handleRemoveBook = (bookId: string) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa sách này?",
            onConfirm: async () => {
                if (await removeBook(bookId)) {
                    load();
                }
            },
            onReject: () => {}
        })
    }

    useEffect(() => {
        if(isApiReady) init()
    }, [isApiReady]);

    useEffect(() => {
        if(isApiReady) load()
    }, [page, isApiReady]);

    // for updating
    const [updatingId, setUpdatingId] = useState<string|null>(null);
    const [updatingBook, setUpdatingBook] = useState<BookDTO|null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [selectedCates, setSelectedCates] = useState<CategorySelectItemDTO[]>([]);
    // const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    const handleUploadCover = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUpdatingBook(prev => ({
                ... prev!,
                cover: e.target.files![0]
            }));
            const fileReader = new FileReader();
            fileReader.onload = () => setPreviewImageUrl(fileReader.result as string);
            fileReader.readAsDataURL(e.target.files![0]);
            e.target.value = '';
        } catch {
            showErrorToast('Tải ảnh thất bại')
        }
    }
    const handleAddCate = (e: CategorySelectItemDTO) => {
        if (selectedCates.includes(e)) {
            showInfoToast('Danh mục đã được thêm');
            return;
        }
        setSelectedCates(prev => [...prev, e]);
    }
    const handleRemoveCate = (e: CategorySelectItemDTO) => {
        setSelectedCates(selectedCates.filter(sc => sc != e))
    }
    const handleUpdateBook = async () => {
        setFormFocus(true);
        if (await updateBook(updatingId!, {
            ... updatingBook!,
            categoryIds: selectedCates.map(e => e.id)
        })) {
            setUpdatingId(null);
            setUpdatingBook(null);
            setSelectedCates([]);
            setPreviewImageUrl(null);
            load();
        }
    }

    return (
        <div className="list-book">
            <div className="d-flex flex-column w-100">
                {/* Top action */}
                <div className="d-flex align-items-center">
                    <Button label="Thêm sách" onClick={() => navigate('/admin/product/create')} icon={<i className='bx bx-plus'></i>}></Button>
                </div>

                {/* Quick filter */}
                <div className="card card-body mt-2 rounded-0">
                    <div className="d-flex filter">
                        {/* Category */}
                        <div className="d-flex flex-column">
                            <label>Danh mục <i className="text-secondary">(Đã chọn {categoryIds.length})</i></label>
                            <div className="scrollable vertical-scrollable mt-1" style={{maxHeight: '100px'}}>
                                {
                                    categories.map(e => (
                                        <div className="d-flex">
                                            <input type="checkbox" checked={e.isChecked} onClick={() => handleOnClickCateItem(e.id)}/>
                                            <div className="ms-2 max-1-line fw-bold">{e.name}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="d-flex flex-column ms-3">
                            <div className="d-flex">
                                {/* name */}
                                <div className="d-flex flex-column me-3">
                                    <label className="w-100 mb-1">Tên</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)}/>
                                </div>

                                {/* Order by */}
                                <div className="d-flex flex-column me-3">
                                    <label className="w-100 mb-1">Sắp xếp</label>
                                    <select value={sortBy + '-' + order} style={{height: 'fit-content'}} onChange={e => handleChangeSortOption(e.target.value)}>
                                        <option value="name-asc">Tên tăng dần</option>
                                        <option value="name-desc">Tên giảm dần</option>
                                        <option value="createdAt-desc">Mới thêm</option>
                                        <option value="price-asc">Giá tăng dần</option>
                                        <option value="price-desc">Giá giảm dần</option>
                                    </select>
                                </div>

                                {/* Min price */}
                                <div className="d-flex flex-column me-3">
                                    <label className="w-100 mb-1">Giá thấp nhất</label>
                                    <input type="number" value={minPrice || ''} onChange={e => setMinPrice(Number(e.target.value))}/>
                                </div>

                                {/* Max price */}
                                <div className="d-flex flex-column me-3">
                                    <label className="w-100 mb-1">Giá cao nhất</label>
                                    <input type="number" value={maxPrice || ''} onChange={e => setMaxPrice(Number(e.target.value))}/>
                                </div>

                                {/* Page size */}
                                <div className="d-flex flex-column">
                                    <label className="mb-1">Sách/trang</label>
                                    <select value={size} style={{width: 'fit-content'}}
                                        onChange={e => setSize(Number(e.target.value))}>
                                        <option value="5">5 </option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>

                            </div>
                            
                            
                            <div className="d-flex mt-3">
                                <Button blackTheme pxSize={14} pxWidth={60} label="Lọc" onClick={() => {setPage(1) ;load()}} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                                <Button pxSize={14} pxWidth={60} label="Đặt lại" className="ms-2" onClick={() => reset()}></Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="position-relative">
                    <Loading isShow={apiLoading}/>
                    <label className="text-info fs-6 my-2">Tìm thấy {totalRecord} kết quả</label>
                    
                    <div className="card card-body rounded-0 p-2">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-auto">#</th>
                                    <th style={{width: '150px'}}>Bìa</th>
                                    <th>Tên</th>
                                    <th>Giá</th>
                                    <th>Thể loại</th>
                                    <th>Đã bán</th>
                                    <th>Cập nhật</th>
                                    <th style={{width: '150px'}}>Tùy chọn</th>
                                </tr>
                            </thead>
                            <tbody>
                                { books.map((e, index) => <>
                                    <tr>
                                        <td>{index + 1 + (page-1) * size}</td>
                                        <td><img src={e.cover || defaultImageUrl} alt="" /></td>
                                        <td>{e.name}</td>
                                        <td>{e.price} {e.currency}</td>
                                        <td>{e.categories.join(', ')}</td>
                                        <td>{e.soldCount}</td>
                                        <td>{convertDateToTimeSpan(e.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex action mt-2">
                                                <i className="fas fa-info-circle" title="Xem thông tin chi tiết" onClick={() => {
                                                    navigate('/book?id=' + e.id);
                                                }}></i>
                                                <i className='bx bx-bar-chart-alt-2' title="Thông số bán hàng"></i>
                                                <i className='bx bx-pencil' onClick={() => {
                                                    navigate('/admin/product/update?id=' + e.id);
                                                }}></i>
                                                <i className='bx bx-trash-alt' onClick={() => handleRemoveBook(e.id)}></i>
                                            </div>
                                        </td>
                                    </tr>
                                </>) }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center">
                    <Pagination className="my-3" page={page} total={totalPage} onPageChange={p => {
                        setPage(p);
                        scrollToObject("table");
                    }}/>
                </div>
            </div>

        </div>
    );
}

export default ListBook;
