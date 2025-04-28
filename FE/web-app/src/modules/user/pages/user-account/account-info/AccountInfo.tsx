import React, { useEffect, useState } from "react";
import './AccountInfo.css';
import { Gender, UserProfileDTO, useUser } from "../../..";
import { AppDispatch, Button, dateToInputValue, defaultImageUrl, endLoadingStatus, Loading, OutletContextProp, showErrorToast, startLoadingStatus, stringToDate, useAppContext, ValidatableInput } from "../../../../shared";
import { useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";

export const AccountInfo = () => {
    const { apiLoading, getProfile, updateProfile, updateUserLocalInfo } = useUser();
    const appContext = useAppContext();

    const [profile, setProfile] = useState<UserProfileDTO|null>(null);
    const [avatarImage, setAvatarImage] = useState<File|null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [backup, setBackup] = useState<UserProfileDTO|null>(null);
    
    const init = async () => {
        const data = await getProfile();
        if(data) {
            setProfile(data);
            setBackup(data);
        }
    }

    const handleUpdateAction = () => {
        appContext?.showConfirmDialog({
            message: "Xác nhận cập nhật?",
            onConfirm: async () => {
                setFormFocus(true);
                if(await updateProfile({
                    lastName: profile!.lastName,
                    firstName: profile!.firstName,
                    dateOfBirth: profile!.dateOfBirth,
                    email: profile!.email,
                    gender: profile!.gender,
                    phoneNumber: profile!.phoneNumber,
                    newAvatar: avatarImage
                })) {
                    setBackup(profile);
                    updateUserLocalInfo (profile!.lastName, profile!.firstName, previewAvatar);
                } else {
                    setProfile(backup);
                    setPreviewAvatar(profile?.avatarUrl || null);
                }
            },
            onReject: () => {
                setProfile(backup);
                setPreviewAvatar(profile?.avatarUrl || null);
            }
        });
        
    }

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setAvatarImage(e.target.files![0]);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewAvatar(fileReader.result as string);
                e.target.value = '';
            }
            fileReader.readAsDataURL(e.target.files![0]);
        } catch {
            showErrorToast('Lỗi đọc file');
        }
    }

    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    useEffect(() => {
        if (apiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [apiLoading]);
    
    return (
        <div className="account-info">
            <h5>Thông tin tài khoản</h5>
            { profile && <>
                <div className="card card-body">
                    <div className="row">

                        {/* Image */}
                        <div className="col-2 text-center">
                            <img src={previewAvatar || profile?.avatarUrl || defaultImageUrl } alt="" />
                            <label className="upload-img mt-2 pointer-hover">
                                Tải ảnh lên
                                <input type="file" accept=".PNG, .JPG" hidden onChange={e => handleUploadImage(e)}/>
                            </label>
                        </div>

                        <div className="col-10">
                            <table className="table">
                                <tbody>
                                    {/* Username */}
                                    <tr>
                                        <th>Tên tài khoản:</th>
                                        <td>{profile.userName}</td>
                                    </tr>
                                    {/* Last name */}
                                    <tr>
                                        <th>Họ đệm:</th>
                                        <td>
                                            <input value={profile.lastName} type="text" onChange={e => setProfile({
                                                    ... profile!,
                                                    lastName: e.target.value
                                                })}/>
                                        </td>
                                    </tr>
                                    {/* First name */}
                                    <tr>
                                        <th>Tên:</th>
                                        <td>
                                            <input value={profile.firstName} type="text" onChange={e => setProfile({
                                                    ... profile!,
                                                    firstName: e.target.value
                                                })}/>
                                        </td>
                                    </tr>
                                    
                                    {/* Email */}
                                    <tr>
                                        <th>Email:</th>
                                        <td>
                                            <input value={profile.email} type="text" onChange={e => setProfile({
                                                    ... profile!,
                                                    email: e.target.value
                                                })}/>
                                        </td>
                                    </tr>
                                    {/* PhoneNumber */}
                                    <tr>
                                        <th>Số điện thoại:</th>
                                        <td>
                                            <input value={profile.phoneNumber} type="text" onChange={e => setProfile({
                                                    ... profile!,
                                                    phoneNumber: e.target.value
                                                })}/>
                                        </td>
                                    </tr>
                                    {/* Sex */}
                                    <tr>
                                        <th>Giới tính:</th>
                                        <td>
                                            <select onChange={e => setProfile({
                                                ... profile!,
                                                gender: e.target.value as Gender
                                            })}>
                                                <option value="Male" selected={profile?.gender == 'Male'}>Nam</option>
                                                <option value="Female" selected={profile?.gender == 'Female'}>Nữ</option>
                                                <option value="Other" selected={profile?.gender == 'Other'}>Khác</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {/* DOB */}
                                    <tr>
                                        <th>Ngày sinh:</th>
                                        <td>
                                            <input 
                                                onChange={e => setProfile({ ... profile!, dateOfBirth: stringToDate(e.target.value) })} 
                                                type="date" 
                                                value={dateToInputValue(profile?.dateOfBirth)}/>
                                            {/* <ValidatableInput 
                                                isFormFocus={formFocus}
                                                type="date" 
                                                initVal={profile?.dateOfBirth?  profile.dateOfBirth.toISOString().split('T')[0]:''}
                                                valueChange={val => setProfile({
                                                    ... profile!,
                                                    dateOfBirth: new Date(val)
                                                })} 
                                                validator={val => null}/> */}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <Button pxWidth={100} blackTheme label="Lưu thay đổi" onClick={() => handleUpdateAction()}></Button>
                    </div>
                </div>
            </> }
        </div>
    );
}
