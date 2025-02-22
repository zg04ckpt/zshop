import React, { ChangeEvent, useEffect, useState } from "react";
import './ListBook.css';
import Button from "../../../../components/button/Button";
import ProductFilter from "../../../../components/product-filter/ProductFilter";
import { ValidatableInput } from "../../../../components/validatable-input/ValidatableInput";
import { useFetcher, useNavigate, useSearchParams } from "react-router-dom";
import { dateToInputValue, defaultImageUrl, formatDate, scrollToObject, scrollToTop } from "../../../../helper";
import { BookDTO, BookListItemDTO, CategorySelectItemDTO } from "../../../../../features/book/book.model";
import useBook from "../../../../../features/book/book.hook";
import Loading from "../../../../components/loading/Loading";
import { toast } from "react-toastify";
import Pagination from "../../../../components/pagination/Pagination";
import { useAppContext } from "../../../../stores/app.context";

type CategoryCheckBoxSelectItem = CategorySelectItemDTO & {
    isChecked: boolean
}

const ListProduct = () => {
    const appContext = useAppContext();
    const navigate = useNavigate();
    const { getBooksAsListItem, removeBook, getCategoriesAsListItem, updateBook } = useBook();

    const [books, setBooks] = useState<BookListItemDTO[]>([]);
    const [name, setName] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number|null>(null);
    const [maxPrice, setMaxPrice] = useState<number|null>(null);
    const [sortBy, setSortBy] = useState<string>('Name');
    const [order, setOrder] = useState<string>('asc');
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(20);
    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [categories, setCategories] = useState<CategoryCheckBoxSelectItem[]>([]);
    
    

    const init = async () => {
        const cateData = await getCategoriesAsListItem()
        setCategories(cateData.map(e => ({
            ... e,
            isChecked: false
        })));
    }

    const load = async () => {
        setLoading(true);
        debugger
        const res = await getBooksAsListItem({
            name, maxPrice, minPrice, page, size, sortBy, order,
            categoryIds: categories
                .filter(e => e.isChecked)
                .map(e => e.id)
        });
        if (res) {
            setTotalPage(res.totalPage);
            setTotalRecord(res.totalRecord);
            setBooks(res.data)
        }

        setLoading(false);
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
                setLoading(true);
                if (await removeBook(bookId)) {
                    toast.info("Xóa sách thành công.")
                    load();
                }
                setLoading(false);
            },
            onReject: () => {}
        })
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        load()
    }, [page])

    // for updating
    const [updatingId, setUpdatingId] = useState<string|null>(null);
    const [updatingBook, setUpdatingBook] = useState<BookDTO|null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [selectedCates, setSelectedCates] = useState<CategorySelectItemDTO[]>([]);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    const handleUploadCover = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUpdatingBook(prev => ({
                ... prev!,
                cover: e.target.files![0]
            }));
            const fileReader = new FileReader()
            fileReader.onload = () => setPreviewImageUrl(fileReader.result as string)
            fileReader.readAsDataURL(e.target.files![0])
            e.target.value = ''
        } catch {
            toast.error('Tải ảnh thất bại')
        }
    }
    const handleAddCate = (e: CategorySelectItemDTO) => {
        if (selectedCates.includes(e)) {
            toast.error('Danh mục đã được thêm')
            return
        }
        setSelectedCates(prev => [...prev, e]);
    };
    const handleRemoveCate = (e: CategorySelectItemDTO) => {
        setSelectedCates(selectedCates.filter(sc => sc != e))
    };
    const handleUpdateBook = async () => {
        setFormFocus(true);
        setUpdateLoading(true);
        if (await updateBook(updatingId!, {
            ... updatingBook!,
            categoryIds: selectedCates.map(e => e.id)
        })) {
            toast.success("Cập nhật sách thành công");
            setUpdatingId(null);
            setUpdatingBook(null);
            setSelectedCates([]);
            setPreviewImageUrl(null);
            load();
        }
        setFormFocus(false);
        setUpdateLoading(false);
    }

    return (
        <div className="product-management">
            <div className="d-flex flex-column w-100">
                {/* Top action */}
                <div className="d-flex align-items-center">
                    <Button label="Thêm sách" onClick={() => navigate('/admin/product/create')} icon={<i className='bx bx-plus'></i>}></Button>
                </div>

                {/* Quick filter */}
                <div className="d-flex filter mt-2 mb-2">
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
                                <label className="mb-1">Số kết quả / trang</label>
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
                            <Button blackTheme pxSize={14} pxWidth={60} label="Lọc" onClick={() => load()} icon={<i className='bx bxs-filter-alt'></i>}></Button>
                            <Button pxSize={14} pxWidth={60} label="Đặt lại" className="ms-2" onClick={() => reset()}></Button>
                        </div>
                    </div>
                </div>

                {/* Updating */}
                { updatingBook && <>
                    <div className="updating position-relative my-2">
                        <label className="label">Cập nhật</label>
                        <Loading isShow={updateLoading}/>
                        <div className="row">
                            <div className="col-md-4 offset-1">
                                {/* Name */}
                                <label >Tên sách</label>
                                <ValidatableInput 
                                    initVal={updatingBook!.name}
                                    isFormFocus={formFocus}
                                    type="text"
                                    valueChange={val => setUpdatingBook(prev => ({
                                        ... prev!,
                                        name: val
                                    }))} 
                                    validator={val => {
                                        if (!val) return "Tên sách không được bỏ trống";
                                        return null;
                                    }}/>

                                <div className="row g-3">
                                    <div className="col-md-4">
                                        {/* Cover */}
                                        <label className="">Bìa sách</label>
                                        <div className="d-flex flex-column">
                                            <img src={previewImageUrl || defaultImageUrl} alt="" />
                                            <label className="upload-img mt-2 w-auto text-center pointer-hover">
                                                Tải ảnh lên
                                                <input type="file" accept=".PNG, .JPG" hidden onChange={e => handleUploadCover(e)}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        {/* Author */}
                                        <label className="">Tên tác giả</label>
                                        <ValidatableInput
                                            isFormFocus={formFocus}
                                            type="text"
                                            initVal={updatingBook!.author}
                                            valueChange={val => setUpdatingBook(prev => ({
                                                ... prev!,
                                                author: val
                                            }))}
                                            validator={val => {
                                                if (!val) return "Tên tác giả không được bỏ trống";
                                                return null;
                                            }}/>

                                        {/* Categories */}
                                        <div className="d-flex">
                                            <label className="">Thể loại</label>
                                            <div className="flex-fill"></div>
                                            <a href="" className="text-decoration-none d-flex align-items-center" data-bs-toggle="dropdown">
                                                <i className='bx bx-plus'></i>
                                                <div>Thêm thể loại</div>
                                            </a>
                                            <div className="dropdown-menu dropdown-menu-end rounded-0 py-0">
                                                { categories.map(e => <>
                                                    <div className="dropdown-item" onClick={() => handleAddCate(e)}>{e.name}</div>
                                                </>) }
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column cate-list mt-2">
                                            {  selectedCates.map(e => <>
                                                <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                                    <div>{e.name}</div>
                                                    <i className='bx bx-x' onClick={() => handleRemoveCate(e)}></i>
                                                </div>
                                            </>) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                {/* Description */}
                                <label>Mô tả sách</label>
                                <ValidatableInput 
                                    initVal={updatingBook!.description}
                                    isFormFocus={formFocus}
                                    type="text"
                                    isMultiLine
                                    valueChange={val => setUpdatingBook(prev => ({
                                        ... prev!,
                                        description: val
                                    }))}
                                    validator={val => {
                                        if (!val) return "Mô tả không được bỏ trống";
                                        return null;
                                    }}/>
                                
                                {/* Language */}
                                <label>Ngôn ngữ</label>
                                <ValidatableInput 
                                    pxWidth={200}
                                    isFormFocus={formFocus}
                                    type="text"
                                    initVal={updatingBook!.language}
                                    valueChange={val => setUpdatingBook(prev => ({
                                        ... prev!,
                                        language: val
                                    }))}
                                    validator={val => {
                                        if (!val) return "Ngôn ngữ không được bỏ trống";
                                        return null;
                                    }}/>
                            
                                {/* Price */}
                                <label>Giá bán</label>
                                <ValidatableInput 
                                    pxWidth={200}
                                    isFormFocus={formFocus}
                                    type="number"
                                    initVal={updatingBook!.price.toString()}
                                    valueChange={val => setUpdatingBook(prev => ({
                                        ... prev!,
                                        price: Number(val)
                                    }))}
                                    validator={val => {
                                        if (!val) return 'Vui lòng nhập giá';
                                        if (Number(val) < 0) return "Giá không hợp lệ";
                                        return null;
                                    }}/>
                                
                                {/* Publish date */}
                                <label>Ngày xuất bản</label>
                                <ValidatableInput 
                                    pxWidth={300}
                                    type="date"
                                    isFormFocus={formFocus}
                                    initVal={dateToInputValue(updatingBook?.publishDate)}
                                    valueChange={val => setUpdatingBook(prev => ({
                                        ... prev!,
                                        publishDate: new Date(val)
                                    }))}
                                    validator={v => {
                                        if (!v) return "Vui lòng chọn ngày xuất bản";
                                        return null
                                    }}/>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            <Button label="Hủy" pxSize={16} pxWidth={100} className="me-2" onClick={() => {
                                setUpdatingId(null);
                                setUpdatingBook(null);
                                setSelectedCates([]);
                                setPreviewImageUrl(null);
                            }}></Button>
                            <Button label="Lưu" pxSize={16} pxWidth={100} blackTheme className="" onClick={() => handleUpdateBook()}></Button>
                        </div>
                    </div> 
                </> }

                {/* List */}
                <label className="text-info fs-6">Tìm thấy {totalRecord} kết quả</label>
                <table className="w-100 mt-2 position-relative">
                    <Loading isShow={loading}/>
                    <thead>
                        <tr>
                            <th className="w-auto">#</th>
                            <th style={{width: '150px'}}>Bìa</th>
                            <th>Tên</th>
                            <th>Giá</th>
                            <th>Thể loại</th>
                            <th>Tác giả</th>
                            <th>Cập nhật</th>
                            <th  style={{width: '150px'}}>Tùy chọn</th>
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
                                <td>{e.author}</td>
                                <td>{formatDate(e.updatedAt)}</td>
                                <td>
                                    <div className="d-flex action mt-2">
                                        <i className='bx bxs-hot' title="Đặt là nổi bật"></i>
                                        <i className='bx bx-bar-chart-alt-2' title="Thông số bán hàng"></i>
                                        <i className='bx bx-pencil' onClick={() => {
                                            setUpdatingId(e.id);
                                            setUpdatingBook({
                                                name: e.name,
                                                author: e.name,
                                                categoryIds: [],
                                                cover: null,
                                                description: e.description,
                                                language: e.language,
                                                price: e.price,
                                                publishDate: e.publishDate
                                            })
                                            setPreviewImageUrl(e.cover)
                                            setSelectedCates(e.categories.map(name => ({
                                                id: categories.find(c => c.name == name)!.id,
                                                name
                                            })))
                                            scrollToObject('.updating');
                                        }}></i>
                                        <i className='bx bx-trash-alt' onClick={() => handleRemoveBook(e.id)}></i>
                                    </div>
                                </td>
                            </tr>
                        </>) }
                    </tbody>
                </table>

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

export default ListProduct;
