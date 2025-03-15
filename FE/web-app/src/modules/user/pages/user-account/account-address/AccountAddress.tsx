import React, { useEffect, useState } from "react";
import './AccountAddress.css';
import { Button, Loading, useAppContext } from "../../../../shared";
import { AddAddressDialog, AddressItemDTO, useUser } from "../../..";
export const AccountAddress = () => {
    const appContext = useAppContext();
    const {apiLoading, getAddresses, removeAddress, setDefaultAddress } = useUser();

    const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
    const [addresses, setAddresses] = useState<AddressItemDTO[]>([]);
    
    const init = async () => {
        setAddresses(await getAddresses());
    }

    useEffect(() => {
        init();
    }, []);

    const handleSetDefault = async (id: string) => {
        if (await setDefaultAddress(id)) {
            init();
        };
    }
    
    const handleRemoveAddress = (id: string) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa địa chỉ này?",
            onReject: () => {},
            onConfirm: async () => {
                if (await removeAddress(id)) {
                    init();
                };
            }
        })
        
    }

    return (
        <>
            <div className="address">
                <div className="card card-body rounded-0 ">
                    <div className="d-flex flex-column">
                        <Button icon={<i className='bx bx-plus-circle'></i>} label="Thêm địa chỉ mới" onClick={() => setShowAddDialog(true)}></Button>

                        <div className="list d-flex flex-column" style={{minHeight: '100px'}}>
                            <Loading isShow={apiLoading}/>

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
