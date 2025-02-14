import React, { useEffect, useState } from "react";
import './Address.css';
import Button from "../../../components/button/Button";
import { ValidatableInput } from "../../../components/validatable-input/ValidatableInput";
import { useUser } from "../../../../features/user/user.hook";
import { AddressDataDTO, AddressItemDTO, AddressSelectItemDTO } from "../../../../features/user/user.model";
import { data } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../../components/loading/Loading";
import AddAddressDialog from "../../../../features/user/components/add-address-dialog/AddAddressDialog";
import { useAppContext } from "../../../stores/app.context";

const Address = () => {
    const appContext = useAppContext();
    const { getAddresses, removeAddress, setDefaultAddress } = useUser();

    const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [addresses, setAddresses] = useState<AddressItemDTO[]>([]);
    
    const init = async () => {
        setListLoading(true);
        setAddresses(await getAddresses());
        setListLoading(false);
    }

    useEffect(() => {
        init();
    }, []);

    const handleSetDefault = async (id: string) => {
        setListLoading(true);
        if (await setDefaultAddress(id)) {
            init();
            toast.success('Cập nhật thành công.');
        };
        setListLoading(false);
    }
    
    const handleRemoveAddress = (id: string) => {
        appContext?.showConfirmDialog({
            message: "Xác nhận xóa địa chỉ này?",
            onReject: () => {},
            onConfirm: async () => {
                setListLoading(true);
                if (await removeAddress(id)) {
                    init();
                    toast.success('Xóa thành công.');
                };
                setListLoading(false);
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
                            <Loading isShow={listLoading}/>

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

export default Address;