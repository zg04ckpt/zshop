import React, { useEffect, useState } from "react";
import '../../styles/pages/AccountAddress.css';
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from "../../stores";
import { AddressItemDTO } from "../../types/user";
import { getAddresses, removeAddress, setAddressDefault } from "../../api";
import Button from "../../components/Button";
import { useDispatch } from "react-redux";
import { AddAddressDialog } from "../../components/AddAddressDialog";

export const AccountAddress = () => {
    const appContext = useAppContext();
    const dispatch = useDispatch<AppDispatch>();

    const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
    const [addresses, setAddresses] = useState<AddressItemDTO[]>([]);
    
    const init = async () => {
        setAddresses((await getAddresses()).data!);
    }

    useEffect(() => {
        init();
    }, []);

    const handleSetDefault = async (id: string) => {
        dispatch(startLoadingStatus());
        if ((await setAddressDefault(id)).isSuccess) {
            init();
        };
        dispatch(endLoadingStatus());
    }
    
    const handleRemoveAddress = (id: string) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa địa chỉ này?",
            onReject: () => {},
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                if ((await removeAddress(id)).isSuccess) {
                    init();
                };
                dispatch(endLoadingStatus());
            }
        })
        
    }

    return (
        <>
            <div className="address">
                <h5>Danh sách địa chỉ</h5>
                <div className="card card-body rounded-0 ">
                    <div className="d-flex flex-column">
                        <Button icon={<i className='bx bx-plus-circle'></i>} label="Thêm địa chỉ mới" onClick={() => setShowAddDialog(true)}></Button>

                        <div className="list d-flex flex-column" style={{minHeight: '100px'}}>
                            { addresses.length > 0 && addresses.map(e => 
                                <div className={`d-flex flex-column address-option mt-3 p-2 position-relative ${e.isDefault? 'default':''}`}>

                                    { !e.isDefault && <Button className="mb-2" label="Đặt làm mặc định" onClick={() => handleSetDefault(e.id)}></Button> }
                                    
                                    <div className="d-flex align-items-center">
                                        <i className='bx bx-user'></i>
                                        <div className="ms-2">{e.receiverName}</div>
                                        <i className='bx bx-phone ms-3'></i>
                                        <div className="ms-2">{e.phoneNumber}</div>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <i className='bx bx-home-alt'></i>
                                        <div className="ms-2 max-1-line">{e.detail}, {e.ward}, {e.district}. {e.city}</div>
                                    </div>
                                    
                                    <div className="change-address d-flex">
                                        { !e.isDefault && (
                                            <i className='bx bx-trash' title="Xóa địa chỉ này" onClick={() => handleRemoveAddress(e.id)}></i>
                                        )}
                                    </div>
                                </div>
                            ) }
                        </div>


                    </div>
                </div>
            </div>

            <AddAddressDialog isShow={showAddDialog} onClose={() => {
                init();
                setShowAddDialog(false);
            }}/>
        </>
    );
}
