import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import './CreateBook.css';
import { useNavigate, useOutletContext } from "react-router-dom";
import { CategorySelectItemDTO, CKeditor, useBook } from "../../..";
import { AppDispatch, Button, dateToInputValue, defaultImageUrl, deleteFromLocal, endLoadingStatus, formatDate, getFromLocal, Loading, OutletContextProp, saveToLocal, showErrorToast, startLoadingStatus, useAppContext, ValidatableInput, ValidatableInput2 } from "../../../../shared";
import { useDispatch } from "react-redux";
import { FormControl, TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const CreateBook = () => {
    const { apiLoading, createNewBook, getCategoriesAsListItem } = useBook();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const appContext = useAppContext();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [cover, setCover] = useState<File|null>(null);
    const [name, setName] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publishYear, setPublishYear] = useState<number>(0);
    const [pageCount, setPageCount] = useState<number>(0);
    const [publisher, setPublisher] = useState<string>('');
    const [language, setLanguage] = useState<string>('');
    const [price, setPrice] = useState<number|null>(null);
    const [stock, setStock] = useState<number|null>(null);
    const [description, setDescription] = useState<string>('');
    const [previewImageUrl, setPreviewImageUrl] = useState<string|null>(null);
    const [categories, setCategories] = useState<CategorySelectItemDTO[]>([]);
    const fileUploadInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<{
        id: number,
        file: File,
        previewUrl: string
    }[]>([]);
    const [selectedCates, setSelectedCates] = useState<CategorySelectItemDTO[]>([]);

    const handleUploadCover = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setCover(e.target.files![0]);
            const fileReader = new FileReader();
            fileReader.onload = () => setPreviewImageUrl(fileReader.result as string);
            fileReader.readAsDataURL(e.target.files![0]);
            e.target.value = '';
        } catch {
            showErrorToast('Tải file thất bại')
        }
    }

    const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const fileReader = new FileReader();
            const file = e.target.files![0];
            fileReader.onload = () => setImages(prev => [
                ... prev,
                {
                    id: prev.length + 1,
                    file: file,
                    previewUrl: fileReader.result as string
                }
            ]);;
            fileReader.readAsDataURL(e.target.files![0]);
            e.target.value = '';
        } catch {
            showErrorToast('Tải file thất bại')
        }
    }

    const init = async () => {
        setCategories(await getCategoriesAsListItem());
    }

    const handleAddCate = (e: CategorySelectItemDTO) => {
        if (selectedCates.includes(e)) {
            showErrorToast('Danh mục đã được thêm');
            return;
        }
        setSelectedCates(prev => [...prev, e]);
    };

    const handleRemoveCate = (e: CategorySelectItemDTO) => {
        setSelectedCates(selectedCates.filter(sc => sc != e))
    };

    useEffect(() => {
        if(isApiReady) init()
    }, [isApiReady])

    // Check unsend data
    useEffect(() => {
        const unsendData = getFromLocal('CreateBookTempData');
        if (!unsendData) return;
        if (unsendData.name || unsendData.author || unsendData.publishDate || unsendData.language || 
            unsendData.price || 
            unsendData.stock || unsendData.description || unsendData.selectedCates) {
            appContext?.showConfirmDialog({
                message: "Bạn có thông tin sách chưa hoàn thành, có muốn khôi phục?",
                onConfirm: () => {
                    console.log(unsendData)
                    setName(unsendData.name);
                    setAuthor(unsendData.author);
                    setPublishYear(unsendData.publishYear);
                    setPageCount(unsendData.pageCount);
                    setPublisher(unsendData.publisher);
                    setLanguage(unsendData.language);
                    setPrice(unsendData.price);
                    setStock(unsendData.stock);
                    setDescription(unsendData.description);
                    setSelectedCates(unsendData.selectedCates);
                },
                onReject: () => {
                    debugger
                    deleteFromLocal('CreateBookTempData');
                }
            });
        }
    }, [])

    // Save form when happen any change
    useEffect(() => {
        if (name || author || publishYear != 0 || language || price || 
            stock || description || selectedCates.length > 0) 
        {
            saveToLocal('CreateBookTempData', {
                name, author, publishYear, language, price, 
                publisher, pageCount,
                stock, description, selectedCates
            });
        } else {
            deleteFromLocal('CreateBookTempData');
        }
    }, [
        name, author, publishYear, language, price, publisher,
        pageCount,
        stock, description, selectedCates
    ]);

    const handleCreateBook = async () => {
        setFormFocus(true);
        if (await createNewBook({
            name, cover, author, description, language, price: price ?? 0, publishYear,
            pageCount, publisher, images: images.map(e => ({
                id: -1,
                image: e.file
            })),
            categoryIds: selectedCates.map(e => e.id), stock: stock ?? 0
        })) {
            deleteFromLocal('CreateBookTempData');
            navigate('/admin/product')
        }
    }

    return (
        <div className="create-book">
            <div className="d-flex my-2">
                <Button label="Quay lại danh sách"
                        icon={<i className='bx bx-chevron-left'></i>} 
                        onClick={() => navigate('/admin/product')}></Button>
                </div>
                <h5 className="label mb-2">Thêm sách mới</h5>
                <div className="card card-body py-4">
                    <div className="row position-relative mx-1">
                        <Loading isShow={apiLoading}/>
                        <div className="col-md-6">
                            {/* Name */}
                            <ValidatableInput2
                                isMaxWidth
                                className="mb-3"
                                label="Nhập tên sách"
                                isFormFocus={formFocus}
                                type="text"
                                initVal={name}
                                valueChange={val => setName(val)} 
                                validator={val => {
                                    if (!val.trim()) return "Tên sách không được bỏ trống hoặc chỉ chứa space";
                                    return null;
                                }}/>
                            
                            <div className="d-flex">
                                <div className="d-flex flex-column">
                                    {/* Cover */}
                                    <label className="">Bìa sách</label>
                                    <div className="d-flex flex-column">
                                        <img className="upload-img" src={previewImageUrl || defaultImageUrl} alt="" />
                                        <label className="btn btn-sm btn-outline-dark mt-2 w-auto text-center pointer-hover">
                                            Tải ảnh lên
                                            <input type="file" accept=".PNG, .JPG" hidden onChange={e => handleUploadCover(e)}/>
                                        </label>
                                    </div>
                                </div>

                                

                                <div className="d-flex flex-column ms-2 flex-fill">
                                    {/* Author */}
                                    {/* <label className="">Tên tác giả</label>
                                    <ValidatableInput
                                        isFormFocus={formFocus}
                                        type="text"
                                        initVal={author}
                                        valueChange={val => setAuthor(val)} 
                                        validator={val => {
                                            if (!val) return "Tên tác giả không được bỏ trống";
                                            return null;
                                        }}/> */}
                                    
                                    {/* Author */}
                                    <ValidatableInput2
                                        className="mb-3"
                                        isMaxWidth
                                        label="Nhập tên tác giả"
                                        isFormFocus={formFocus}
                                        type="text"
                                        initVal={author}
                                        valueChange={val => setAuthor(val)} 
                                        validator={val => {
                                            if (!val.trim()) return "Tên tác giả không được bỏ trống";
                                            return null;
                                        }}/>

                                    {/* Stock */}
                                    <ValidatableInput2
                                        className="mb-3"
                                        isMaxWidth
                                        label="Nhập số lượng còn"
                                        isFormFocus={formFocus}
                                        type="number"
                                        initVal={stock?.toString()}
                                        valueChange={val => setStock(Number(val))} 
                                        validator={val => {
                                            if (!val) return 'Vui lòng nhập giá';
                                            if (Number(val) < 0) return "Giá không hợp lệ";
                                            return null;
                                        }}/>

                                    {/* Stock */}
                                    {/* <label className="">Số lượng</label>
                                    <ValidatableInput
                                        isFormFocus={formFocus}
                                        type="text"
                                        initVal={stock.toString()}
                                        valueChange={val => setStock(Number(val))} 
                                        validator={val => null}/> */}

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
                                        { selectedCates.map(e => <>
                                            <div className="d-flex cate-item mb-1 py-1 px-1 justify-content-between">
                                                <div>{e.name}</div>
                                                <i className='bx bx-x' onClick={() => handleRemoveCate(e)}></i>
                                            </div>
                                        </>) }
                                    </div>
                                </div>
                            </div>
                            
                            {/* Images */}
                            <label className="mt-3">Ảnh minh họa</label>
                            <div className="d-flex mt-2">
                                <input type="file" ref={fileUploadInputRef} onChange={e => handleUploadImage(e)} hidden accept=".png, .jpg"/>
                                <button className="bg-white rounded-1 border-1 me-2" onClick={() => fileUploadInputRef.current?.click()}>
                                    <i className="fa-solid fa-image"></i> Thêm ảnh</button>
                                {/* <button className="bg-white rounded-1 border-1 me-3"><i className="fa-solid fa-video"></i> Thêm video</button> */}
                                <span><i className="text-secondary">(Tải lên tối thiểu 3 ảnh định dạng PNG/JPG)</i></span>
                            </div>
                            <div className="d-flex mt-3">
                                {images.map(e => <>
                                    <div className="review-item position-relative me-2">
                                        <img src={e.previewUrl} className="rounded-2 shadow-sm object-fit-cover"  width={120} height={120} alt="" />
                                        <i className="fa-solid fa-xmark position-absolute top-0 m-1 end-0" onClick={() => {
                                            setImages(prev => {
                                                prev = prev.filter(i => i.id != e.id);
                                                return prev;
                                            });
                                        }}></i>
                                    </div>
                                </>)}
                            </div>
                        </div>
                        <div className="col-md-6">
                            {/* <ValidatableInput2
                                isMaxWidth
                                className="mb-3"
                                label="Nhập mô tả"
                                isFormFocus={formFocus}
                                initVal={description}
                                type="text"
                                isMultiLine
                                valueChange={val => setDescription(val)} 
                                validator={val => {
                                    if (!val) return "Mô tả không được bỏ trống";
                                    return null;
                                }}/> */}
                            
                            {/* Language */}
                            {/* <label>Ngôn ngữ</label>
                            <ValidatableInput 
                                pxWidth={200}
                                initVal={language}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => setLanguage(val)} 
                                validator={val => {
                                    if (!val) return "Ngôn ngữ không được bỏ trống";
                                    return null;
                                }}/> */}

                            {/* Language */}
                            <ValidatableInput2
                                className="mb-3"
                                label="Nhập ngôn ngữ"
                                initVal={language}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => setLanguage(val)} 
                                validator={val => {
                                    if (!val) return "Ngôn ngữ không được bỏ trống";
                                    return null;
                                }}/>

                            {/* Publisher */}
                            <ValidatableInput2
                                className="mb-3"
                                label="Nhập tên NXB"
                                initVal={publisher}
                                isFormFocus={formFocus}
                                type="text"
                                valueChange={val => setPublisher(val)} 
                                validator={val => {
                                    if (!val) return "Nhà xuất bản không được bỏ trống";
                                    return null;
                                }}/>
                        
                            {/* Price */}
                            {/* <label>Giá bán</label>
                            <ValidatableInput 
                                pxWidth={200}
                                isFormFocus={formFocus}
                                type="number"
                                initVal={price.toString()}
                                valueChange={val => setPrice(Number(val))} 
                                validator={val => {
                                    if (!val) return 'Vui lòng nhập giá';
                                    if (Number(val) < 0) return "Giá không hợp lệ";
                                    return null;
                                }}/> */}
                            
                            {/* Price */}
                            <ValidatableInput2
                                className="mb-3"
                                label="Nhập giá bán"
                                isFormFocus={formFocus}
                                type="number"
                                initVal={price?.toString()}
                                valueChange={val => setPrice(Number(val))} 
                                validator={val => {
                                    if (!val) return 'Vui lòng nhập giá';
                                    if (Number(val) < 0) return "Giá không hợp lệ";
                                    return null;
                                }}/>

                            {/* Page Count */}
                            <ValidatableInput2
                                className="mb-3"
                                label="Nhập số trang"
                                isFormFocus={formFocus}
                                type="number"
                                initVal={pageCount?.toString()}
                                valueChange={val => setPageCount(Number(val))} 
                                validator={val => {
                                    if (!val) return 'Vui lòng nhập số trang';
                                    if (Number(val) < 0) return "Số trang không hợp lệ";
                                    return null;
                                }}/>

                            {/* PublishYear */}
                            <ValidatableInput2
                                className="mb-3"
                                label="Nhập năm xuất bản"
                                isFormFocus={formFocus}
                                type="number"
                                initVal={publishYear?.toString()}
                                valueChange={val => setPublishYear(Number(val))} 
                                validator={val => {
                                    if (!val) return 'Vui lòng nhập năm xuất bản';
                                    if (Number(val) < 0 || Number(val) > new Date().getFullYear()) 
                                        return "Năm xuất bản không hợp lệ";
                                    return null;
                                }}/>
                            
                            {/* Publish date */}
                            {/* <label>Ngày xuất bản</label>
                            <ValidatableInput 
                                pxWidth={300}
                                type="date"
                                initVal={dateToInputValue(publishDate)}
                                isFormFocus={formFocus}
                                valueChange={v => setPublishDate(new Date(v))}
                                validator={v => {
                                    if (!v) return "Vui lòng chọn ngày xuất bản";
                                    return null
                                }}/> */}
                            
                            {/* Publish date */}
                            {/* <FormControl className="me-2">
                                <DatePicker
                                    defaultValue={new Date()}
                                    label="Ngày xuất bản"
                                    value={publishYear}
                                    onChange={d => {
                                        setPublishYear(d);
                                    }}
                                    slotProps={{ textField: { size: 'small' } }}
                                />
                            </FormControl> */}
                            
                        </div>
                        <div className="col-12">
                            <label htmlFor="">Mô tả sách</label>
                            <CKeditor data={description} valueChange={v => {
                                setDescription(v)
                            }}/>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                        <Button label="Lưu" pxSize={16} pxWidth={100} blackTheme className="" onClick={() => handleCreateBook()}></Button>
                    </div>
                </div>
        </div>
    );
}
