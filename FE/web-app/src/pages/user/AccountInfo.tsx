import React, { useEffect, useState } from "react";
import '../../styles/pages/AccountInfo.css';
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, setUser, startLoadingStatus, useAppContext } from "../../stores";
import { Gender, UserProfileDTO } from "../../types/user";
import { getProfile, updateProfile } from "../../api";
import { showErrorToast } from "../../utils";
import { OutletContextProp } from "../../types/base";
import Button from "../../components/Button";
import { dateToInputValue, defaultImageUrl, stringToDate } from "../../utils/helper";

export const AccountInfo = () => {
    const appContext = useAppContext();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfileDTO|null>(null);
    const [avatarImage, setAvatarImage] = useState<File|null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string|null>(null);
    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [backup, setBackup] = useState<UserProfileDTO|null>(null);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    
    const init = async () => {
        const res = await getProfile();
        if(res.isSuccess) {
            setProfile(res.data!);
            setBackup(res.data!);
        }
    }

    const handleUpdateAction = () => {
        appContext?.showConfirmDialog({
            message: "Xác nhận cập nhật?",
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                setFormFocus(true);

                const res = await updateProfile({
                    lastName: profile!.lastName,
                    firstName: profile!.firstName,
                    dateOfBirth: profile!.dateOfBirth,
                    email: profile!.email,
                    gender: profile!.gender,
                    phoneNumber: profile!.phoneNumber,
                    newAvatar: avatarImage
                });

                if(res.isSuccess) {
                    setBackup(profile);
                    if (user) {
                        dispatch(setUser({
                            ...user,
                            firstName: profile!.firstName,
                            lastName: profile!.lastName,
                            avatarUrl: previewAvatar
                        }));
                    }
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

    const { isApiReady } = useOutletContext<OutletContextProp>();

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    // useEffect(() => {
    //     if (apiLoading) dispatch(startLoadingStatus());
    //     else dispatch(endLoadingStatus());
    // }, [apiLoading]);
    
    return (
        <div className="account-info">
            <h5>Thông tin tài khoản</h5>
            <div className="d-flex mb-3">
                <Button pxWidth={100} label="Đổi mật khẩu" onClick={() => navigate('/change-pass')}></Button>
            </div>
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
