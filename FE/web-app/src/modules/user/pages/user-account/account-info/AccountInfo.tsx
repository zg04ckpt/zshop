import React, { useEffect, useState } from "react";
import './AccountInfo.css';
import { UserProfileDTO, useUser } from "../../..";
import { Button, dateToInputValue, defaultImageUrl, Loading, showErrorToast, stringToDate, useAppContext, ValidatableInput } from "../../../../shared";

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
                    genderId: profile!.genderId,
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

    useEffect(() => {
        init();
    }, []);
    
    return (
        <div className="account-info">
            <div className="card card-body rounded-0">
                <Loading isShow={apiLoading}/>
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
                        <table className="table ">
                            <tbody>
                                {/* Username */}
                                <tr>
                                    <th>Tên tài khoản:</th>
                                    <td>{profile?.userName}</td>
                                </tr>
                                {/* Last name */}
                                <tr>
                                    <th>Họ đệm:</th>
                                    <td>
                                        <ValidatableInput 
                                            isFormFocus={formFocus}
                                            type="text" 
                                            initVal={profile?.lastName || ''}
                                            valueChange={val => setProfile({
                                                ... profile!,
                                                lastName: val
                                            })} 
                                            validator={val => {
                                                if (!val) return "Họ đệm không được bỏ trống";
                                                return null;
                                            }}/>
                                    </td>
                                </tr>
                                {/* First name */}
                                <tr>
                                    <th>Tên:</th>
                                    <td>
                                        <ValidatableInput 
                                            isFormFocus={formFocus}
                                            type="text" 
                                            initVal={profile?.firstName}
                                            valueChange={val => setProfile({
                                                ... profile!,
                                                firstName: val
                                            })} 
                                            validator={val => {
                                                if (!val) return "Tên không được bỏ trống";
                                                return null;
                                            }}/>
                                    </td>
                                </tr>
                                
                                {/* Email */}
                                <tr>
                                    <th>Email:</th>
                                    <td>
                                        <ValidatableInput 
                                            isFormFocus={formFocus}
                                            type="text" 
                                            initVal={profile?.email}
                                            valueChange={val => setProfile({
                                                ... profile!,
                                                email: val
                                            })} 
                                            validator={val => {
                                                if (!val) return `Email không được bỏ trống.`;
                                                if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}$/.test(val))
                                                    return `Email không hợp lệ`;
                                                return null;
                                            }}/>
                                    </td>
                                </tr>
                                {/* PhoneNumber */}
                                <tr>
                                    <th>Số điện thoại:</th>
                                    <td>
                                        <ValidatableInput 
                                            isFormFocus={formFocus}
                                            type="text" 
                                            initVal={profile?.phoneNumber}
                                            valueChange={val => setProfile({
                                                ... profile!,
                                                phoneNumber: val
                                            })} 
                                            validator={val => {
                                                if (!val) return `Số điện thoại không được bỏ trống.`;
                                                if (!/^[0-9]+$/.test(val))
                                                    return `Số điện thoại chỉ chứa chữ số`;
                                                return null;
                                            }}/>
                                    </td>
                                </tr>
                                {/* Sex */}
                                <tr>
                                    <th>Giới tính:</th>
                                    <td>
                                        <select onChange={e => setProfile({
                                            ... profile!,
                                            genderId: Number(e.target.value)
                                        })}>
                                            <option value="1" selected={profile?.genderId == 1}>Nam</option>
                                            <option value="2" selected={profile?.genderId == 2}>Nữ</option>
                                            <option value="3" selected={profile?.genderId == 3}>Khác</option>
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
        </div>
    );
}
