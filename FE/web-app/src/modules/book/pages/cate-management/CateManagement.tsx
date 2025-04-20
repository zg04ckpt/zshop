import React, { ChangeEvent, useEffect, useState } from "react";
import './CateManagement.css';
import { CategoryListItemDTO, useBook } from "../..";
import { Button, defaultImageUrl, convertDateToTimeSpan, Loading, OutletContextProp, scrollToTop,
     showErrorToast, showInfoToast, useAppContext, ValidatableInput, 
     AppDispatch,
     startLoadingStatus,
     endLoadingStatus} from "../../../shared";
import { useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";

export const CateManagement = () => {
    const { createNewCategory, updateCategory, removeCategory, getCategoriesAsListItem } = useBook();
    const appContext = useAppContext()
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const dispatch = useDispatch<AppDispatch>();

    const [previewImg, setPreviewImg] = useState<string|null>(null);
    const [name, setName] = useState<string>('');
    const [parentId, setParentId] = useState<number|null>(null);
    const [thumb, setThumb] = useState<File|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryListItemDTO[]>([]);
    const [action, setAction] = useState<'creating'|'listing'|'updating'>('listing');

    const [updatingId, setUpdatingId] = useState<number|null>(null);

    const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setThumb(e.target.files![0]);
            const fileReader = new FileReader();
            fileReader.onload = () => setPreviewImg(fileReader.result as string);
            fileReader.readAsDataURL(e.target.files![0]);
        } catch {
            showErrorToast('Tải ảnh thất bại')
        }
    }

    const load = async () => {
        setAction('listing');
        dispatch(startLoadingStatus());
        setCategories(await getCategoriesAsListItem());
        dispatch(endLoadingStatus());
    }

    const handleCreateNewCategory = async () => {
        setFormFocus(true);
        setAction('creating');
        dispatch(startLoadingStatus());
        if (await createNewCategory({
            name, 
            parentId: parentId == -1? null:parentId, 
            thumbnail: thumb, 
        })) {
            setPreviewImg(null);
            setThumb(null);
            setName('');
            setParentId(null);
            load();
        }
        dispatch(endLoadingStatus());
    }

    const handleUpdateCategory = async () => {
        dispatch(startLoadingStatus());
        if (await updateCategory(updatingId!, {
            name, parentId, thumbnail: thumb, 
        })) {
            setPreviewImg(null);
            setName('');
            setParentId(-1);
            setUpdatingId(null);
            load();
        }
        dispatch(endLoadingStatus());
    }

    const handleRemoveCategory = async (id: number) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa danh mục này?",
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                if (await removeCategory(id)) {
                    load();
                }
                dispatch(endLoadingStatus());
            },
            onReject: () => {}
        })
    }

    useEffect(() => {
        if(isApiReady) load()
    }, [isApiReady]);

    return (
        <div className="cate-management">
            <div className="row g-3">
                {/* Create */}
                { !updatingId && <>
                    <div className="col-md-4 ">
                        <label className="label fw-light">Tạo danh mục mới</label>
                        <div className="d-flex mt-2 w-100 mb-3 position-relative">
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
                                <select value={parentId ?? -1} onChange={e => {
                                    const id = Number(e.target.value);
                                    if (id) setParentId(id);
                                    else setParentId(-1);
                                }}>
                                    <option value={-1}>--</option>
                                    { categories.map(e => <option value={e.id}>{e.name}</option>) }
                                </select>
                                <Button  blackTheme label="Tạo danh mục mới" className="mt-3" onClick={() => handleCreateNewCategory()}></Button>
                            </div>

                        </div>
                    </div>
                </> }

                {/* List */}
                <div className="col-md-8 position-relative">
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
                                    <td><img src={e.thumbnail} alt=""/></td>
                                    <td>{e.name}</td>
                                    <td><a href="">{e.parentName ?? <>Danh mục gốc</>}</a></td>
                                    <td>{convertDateToTimeSpan(e.updatedAt)}</td>
                                    <td>
                                        <div className="d-flex action mt-2">
                                            <i className='bx bx-pencil' onClick={() => {
                                                setFormFocus(false);
                                                setUpdatingId(e.id);
                                                setName(e.name);
                                                setParentId(e.parentId);
                                                setPreviewImg(e.thumbnail);
                                                scrollToTop()
                                            }}></i>
                                            
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
                            <label>
                                <img src={previewImg || defaultImageUrl} alt=""/>
                                <input type="file" onChange={e => handleUploadFile(e)} hidden accept=".png, .jpg"/>
                            </label>
                            <div className="d-flex flex-fill pe-3 flex-column ms-4">

                                <label htmlFor="">Tên danh mục</label>
                                <input value={name} onChange={e => setName(e.target.value)}/>

                                <label htmlFor="">Danh mục cha</label>
                                <select value={parentId ?? -1} onChange={e => {
                                    const id = Number(e.target.value);
                                    if (id) setParentId(id);
                                    else setParentId(-1);
                                }}>
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