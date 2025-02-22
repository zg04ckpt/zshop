import React, { ChangeEvent, useEffect, useState } from "react";
import './UpdateBook.css';
import Button from "../../../../components/button/Button";
import { ValidatableInput } from "../../../../components/validatable-input/ValidatableInput";
import { defaultImageUrl } from "../../../../helper";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useBook from "../../../../../features/book/book.hook";
import { BookDTO, BookListItemDTO, CategorySelectItemDTO } from "../../../../../features/book/book.model";
import Loading from "../../../../components/loading/Loading";

const UpdateBook = () => {
    const { createNewBook, getCategoriesAsListItem } = useBook();
    const navigate = useNavigate();
    const [ param ] = useSearchParams();

    const [id, setId] = useState<string|null>(null);
    const [book, setBook] = useState<BookDTO|null>(null);

    const [showFilter, setShowFilter] = useState(false);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [cover, setCover] = useState<File|null>(null);
    const [name, setName] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publishDate, setPublishDate] = useState<Date|null>(null);
    const [language, setLanguage] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [previewImageUrl, setPreviewImageUrl] = useState<string|null>(null);
    const [categories, setCategories] = useState<CategorySelectItemDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedCates, setSelectedCates] = useState<CategorySelectItemDTO[]>([]);

    const handleUploadCover = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setCover(e.target.files![0]);
            const fileReader = new FileReader()
            fileReader.onload = () => setPreviewImageUrl(fileReader.result as string)
            fileReader.readAsDataURL(e.target.files![0])
            e.target.value = ''
        } catch {
            toast.error('Tải file thất bại')
        }
    }

    const init = async () => {
        setLoading(true);
        const res = await
        
        setCategories(await getCategoriesAsListItem())
        setLoading(false);
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

    useEffect(() => {
        init()
    }, [])

    const handleCreateBook = async () => {
        setFormFocus(true);
        setLoading(true);

        if (await createNewBook({
            name, cover, author, description, language, price, publishDate,
            categoryIds: selectedCates.map(e => e.id)
        })) {
            toast.success("Tạo sách mới thành công");
            navigate('/admin/product')
        }

        setLoading(false);
    }
    return (
        <div className="product-management">
            <div className="d-flex my-2">
                <Button label="Quay lại danh sách"
                        icon={<i className='bx bx-chevron-left'></i>} 
                        onClick={() => navigate('/admin/product')}></Button>
            </div>
            <h5 className="label">Thêm sách mới</h5>
            <div className="row position-relative mx-1">
                <Loading isShow={loading}/>
                <div className="col-md-6">
                    {/* Name */}
                    <label >Tên sách</label>
                    <ValidatableInput 
                        isFormFocus={formFocus}
                        type="text"
                        valueChange={val => setName(val)} 
                        validator={val => {
                            if (!val) return "Tên sách không được bỏ trống";
                            return null;
                        }}/>

                    <div className="row g-3">
                        <div className="col-md-4">
                            {/* Cover */}
                            <label className="">Bìa sách</label>
                            <div className=" text-center">
                                <img src={previewImageUrl || defaultImageUrl} alt="" />
                                <label className="upload-img mt-2 pointer-hover">
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
                                valueChange={val => setAuthor(val)} 
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
                                { selectedCates.map(e => <>
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
                        isFormFocus={formFocus}
                        type="text"
                        isMultiLine
                        valueChange={val => setDescription(val)} 
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
                        valueChange={val => setLanguage(val)} 
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
                        valueChange={val => setPrice(Number(val))} 
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
                        valueChange={v => setPublishDate(new Date(v))}
                        validator={v => {
                            if (!v) return "Vui lòng chọn ngày xuất bản";
                            return null
                        }}
                        initVal={''}/>
                </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <Button label="Lưu" pxSize={16} pxWidth={100} blackTheme className="" onClick={() => handleCreateBook()}></Button>
            </div>
        </div>
    );
}

export default UpdateBook;