import React, { useEffect, useState } from 'react'
import './AddAddressDialog.css'
import { BaseProp, Button, Loading, ValidatableInput } from '../../../shared';
import { AddressDataDTO, useUser } from '../..';

type AddAddressDialogProp = BaseProp & {
    isShow: boolean;
    onClose: () => void;
}

export const AddAddressDialog = (prop: AddAddressDialogProp) => {

    const { apiLoading, getDefaultAddressData, addAddress } = useUser();

    const [formFocus, setFormFocus] = useState<boolean>(false);
    const [addressData, setAddressData] = useState<AddressDataDTO | null>(null);
    const [filterData, setFilterData] = useState<AddressDataDTO>({
        cities: [],
        districts: [],
        wards: []
    });
    const [city, setCity] = useState<number>(-1);
    const [dist, setDist] = useState<number>(-1);
    const [ward, setWard] = useState<number>(-1);
    const [detail, setDetail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const data = await getDefaultAddressData();
        if (data) {
            setAddressData(data);
            setFilterData({
                ...filterData,
                cities: data.cities
            });
        }
    }

    // update ward when district change
    useEffect(() => {
        if (addressData) {
            setFilterData({
                ...filterData,
                districts: addressData.districts.filter(e => e.parentCode == city),
                wards: []
            });
            setDist(-1);
        }
    }, [city]);

    // update ward when district change
    useEffect(() => {
        if (addressData) {
            setFilterData({
                ...filterData,
                wards: addressData.wards.filter(e => e.parentCode == dist)
            });
            setWard(-1);
        }
    }, [dist]);

    const handleAddAddress = async () => {
        setFormFocus(true);

        if (await addAddress({
            city: addressData?.cities.find(e => e.code == city)?.name || '',
            cityCode: city,
            district: addressData?.districts.find(e => e.code == dist)?.name || '',
            districtCode: dist,
            ward: addressData?.wards.find(e => e.code == ward)?.name || '',
            wardCode: ward,
            detail: detail,
            phoneNumber: phone,
            receiverName: name
        })) {
            setFilterData({
                cities: [],
                districts: [],
                wards: []
            });
            prop.onClose();
        };

    }

    return (
        <>
            { prop.isShow && (
                <div className="add-address-dialog cover-all-bg">
                    <div className="card card-body rounded-0 pt-2 col-lg-4 offset-lg-4 mt-4">
                        <Loading isShow={apiLoading} />
                        <h5 className="text-center mb-3">Thêm địa chỉ mới</h5>

                        <label className="mb-1">Tỉnh/Thành phố</label>
                        <select value={city} className="mb-2" onChange={e => setCity(Number(e.target.value))}>
                            <option value="-1">-- Chọn --</option>
                            {filterData.cities.length > 0 && filterData.cities.map(e =>
                                <option value={e.code}>{e.name}</option>
                            )}
                        </select>

                        <label className="mb-1">Quận/Huyện</label>
                        <select value={dist} className="mb-2" onChange={e => setDist(Number(e.target.value))}>
                            <option value="-1">-- Chọn --</option>
                            {filterData.districts.length > 0 && filterData.districts.map(e =>
                                <option value={e.code}>{e.name}</option>
                            )}
                        </select>

                        <label className="mb-1">Phường/Xã/Thị trấn</label>
                        <select value={ward} className="mb-2" onChange={e => setWard(Number(e.target.value))}>
                            <option value="-1">-- Chọn --</option>
                            {filterData.wards.length > 0 && filterData.wards.map(e =>
                                <option value={e.code}>{e.name}</option>
                            )}
                        </select>

                        <label className="mb-1">Địa chỉ cụ thể</label>
                        <ValidatableInput
                            isFormFocus={formFocus}
                            type="text"
                            valueChange={val => setDetail(val)}
                            validator={val => {
                                if (!val) return "Địa chỉ cụ thể không được bỏ trống";
                                return null;
                            }} />

                        <label className="mb-1">Số điện thoại liên lạc</label>
                        <ValidatableInput
                            isFormFocus={formFocus}
                            type="text"
                            valueChange={val => setPhone(val)}
                            validator={val => {
                                if (!val) return `Số điện thoại không được bỏ trống.`;
                                if (!/^[0-9]+$/.test(val))
                                    return `Số điện thoại chỉ chứa chữ số`;
                                return null;
                            }} />

                        <label className="mb-1">Tên liên lạc</label>
                        <ValidatableInput
                            isFormFocus={formFocus}
                            type="text"
                            valueChange={val => setName(val)}
                            validator={val => {
                                if (!val) return "Tên liên lạc không được bỏ trống";
                                return null;
                            }} />


                        <div className="d-flex justify-content-center mt-3">
                            <Button label="Hủy" pxWidth={100} onClick={() => prop.onClose()}></Button>
                            <Button label="Lưu" pxWidth={100} blackTheme onClick={() => handleAddAddress()} className="ms-1"></Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
