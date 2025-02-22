import React, { ChangeEvent, useEffect, useState } from "react";
import './CateManagement.css';
import logo from "../../../../assets/images/test-img.jpg";
import Button from "../../../components/button/Button";
import { ValidatableInput } from "../../../components/validatable-input/ValidatableInput";
import useBook from "../../../../features/book/book.hook";
import { CategoryListItemDTO } from "../../../../features/book/book.model";
import { defaultImageUrl, formatDate, scrollToTop } from "../../../helper";
import Loading from "../../../components/loading/Loading";
import { toast } from "react-toastify";
import { useAppContext } from "../../../stores/app.context";

const CateManagement = () => {
    const { createNewCategory, updateCategory, removeCategory, getCategoriesAsListItem } = useBook();
    const appContext = useAppContext()

    const [previewImg, setPreviewImg] = useState<string|null>(null);
    const [name, setName] = useState<string>('');
    const [parentId, setParentId] = useState<number>(-1);
    const [thumb, setThumb] = useState<File|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryListItemDTO[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [creatingLoading, setCreatingLoading] = useState<boolean>(false);

    const [updatingId, setUpdatingId] = useState<number|null>(null);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);


    const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setThumb(e.target.files![0]);
            const fileReader = new FileReader();
            fileReader.onload = () => setPreviewImg(fileReader.result as string);
            fileReader.readAsDataURL(e.target.files![0]);
        } catch {
            toast.error('Tải ảnh thất bại')
        }
    }

    const init = async () => {
        setListLoading(true);
        setCategories(await getCategoriesAsListItem())
        setListLoading(false);
    }

    const handleCreateNewCategory = async () => {
        setCreatingLoading(true);
        setFormFocus(true)
        if (await createNewCategory({
            name, parentId, thumbnail: thumb, 
        })) {
            setPreviewImg(null);
            setThumb(null);
            setName('');
            setParentId(-1);
            toast.info("Tạo danh mục mới thành công.")
            init();
        }
        setFormFocus(false)
        setCreatingLoading(false);
    }

    const handleUpdateCategory = async () => {
        setUpdateLoading(true);
        if (await updateCategory(updatingId!, {
            name, parentId, thumbnail: thumb, 
        })) {
            setPreviewImg(null);
            setName('');
            setParentId(-1);
            setUpdatingId(null);
            toast.info("Cập nhật danh mục thành công.")
            init();
        }
        setUpdateLoading(false);
    }

    const handleRemoveCategory = async (id: number) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa danh mục này?",
            onConfirm: async () => {
                setListLoading(true);
                if (await removeCategory(id)) {
                    toast.info("Xóa danh mục thành công.")
                    init();
                }
                setListLoading(false);
            },
            onReject: () => {}
        })
    }

    useEffect(() => {
        init()
    }, []);

    return (
        <div className="cate-management">
            <div className="row g-3">
                {/* Create */}
                { !updatingId && <>
                    <div className="col-md-4 ">
                        <label className="label fw-light">Tạo danh mục mới</label>
                        <div className="d-flex mt-2 w-100 mb-3 position-relative">
                            <Loading isShow={creatingLoading}/>
                            <label>
                                <img src={previewImg || defaultImageUrl} alt=""/>
                                <input type="file" onChange={e => handleUploadFile(e)} hidden accept=".png, .jpg"/>
                            </label>
                            <div className="d-flex flex-fill pe-3 flex-column ms-4">
                                <label htmlFor="">Tên danh mục mới</label>
                                <ValidatableInput 
                                    type="text"
                                    initVal={''}
                                    isFormFocus={formFocus}
                                    validator={s => {
                                        if (!s) return "Tên danh mục trống";
                                        return null;
                                    }}
                                    valueChange={val => setName(val)}/>
                                <label htmlFor="">Danh mục cha</label>
                                <select value={parentId} onChange={e => setParentId(Number(e.target.value))}>
                                    <option value={-1}>--</option>
                                    { categories.map(e => <option value={e.id}>{e.name}</option>) }
                                </select>
                                <Button  blackTheme label="Tạo danh mục mới" className="mt-3" onClick={() => handleCreateNewCategory()}></Button>
                            </div>

                        </div>
                    </div>
                </> }

                {/* Right */}
                <div className="col-md-8 position-relative">
                    <Loading isShow={listLoading}/>

                    <table className="w-100 mt-3 ">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style={{width: '140px'}}>Bìa</th>
                                <th>Tên danh mục</th>
                                <th>Danh mục cha</th>
                                <th>Cập nhật</th>
                                <th>Tùy chọn</th>
                            </tr>
                        </thead>
                        <tbody>
                            { categories.map((e, i) => <>
                                <tr>
                                    <td>{i + 1}</td>
                                    <td><img src={e.thumbnail} alt="" /></td>
                                    <td>{e.name}</td>
                                    <td><a href="">{e.parentName}</a></td>
                                    <td>{formatDate(e.updatedAt)}</td>
                                    <td>
                                        <div className="d-flex action mt-2">
                                            { e.parentId && <>
                                                <i className='bx bx-pencil' onClick={() => {
                                                    setFormFocus(false);
                                                    setUpdatingId(e.id);
                                                    setName(e.name);
                                                    setParentId(e.parentId!);
                                                    setPreviewImg(e.thumbnail);
                                                    scrollToTop()
                                                }}></i>
                                            </> }
                                            
                                            <i className='bx bx-trash-alt' onClick={() => handleRemoveCategory(e.id)}></i>
                                        </div>
                                    </td>
                                </tr> 
                            </>) }
                        </tbody>
                    </table>
                </div>

                {/* Update */}
                { updatingId && <>
                    <div className="col-md-4 ">
                        <label className="label fw-light">Cập nhật danh mục</label>
                        <div className="d-flex mt-2 w-100 mb-3 position-relative">
                            <Loading isShow={updateLoading}/>
                            <label>
                                <img src={previewImg || defaultImageUrl} alt=""/>
                                <input type="file" onChange={e => handleUploadFile(e)} hidden accept=".png, .jpg"/>
                            </label>
                            <div className="d-flex flex-fill pe-3 flex-column ms-4">
                                <label htmlFor="">Tên danh mục</label>
                                <input value={name} onChange={e => setName(e.target.value)}/>
                                <label htmlFor="">Danh mục cha</label>
                                <select value={parentId} onChange={e => setParentId(Number(e.target.value))}>
                                    <option value={-1}>--</option>
                                    { categories.map(e => <option value={e.id}>{e.name}</option>) }
                                </select>
                                <Button  blackTheme label="Cập nhật" className="mt-3" onClick={() => handleUpdateCategory()}></Button>
                            </div>

                        </div>
                    </div>
                </> }
            </div>

        </div>
    );
}

export default CateManagement;