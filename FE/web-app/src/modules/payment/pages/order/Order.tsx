import React, { useEffect, useState } from "react";
import './Order.css'
import { AppDispatch, Button, defaultImageUrl, endLoadingStatus, OutletContextProp, showErrorToast, startLoadingStatus } from "../../../shared";
import { OrderDTO, useOrder } from "../..";
import { useDispatch } from "react-redux";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { sum } from "lodash";
import { Radio, RadioGroup } from "@mui/material";
import { AddressDTO, AddressItemDTO, useUser } from "../../../user";

const Order = () => {
    const { orderApiLoading, confirmOrder, payOrder } = useOrder();
    const { getAddresses } = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const [ param ] = useSearchParams();
    const [ order, setOrder ] = useState<OrderDTO|null>(null);
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const navigate = useNavigate();

    const [ total, setTotal ] = useState<number>(0);
    const [ lastAmount, setLastAmount ] = useState<number>(0);
    const [ showChangeAddressDialog, setShowChangeAddressDialog ] = useState<boolean>(false);
    const [ listAddress, setListAddress ] = useState<AddressItemDTO[]>([]);
    const [ previewAddress, setPreviewAddress ] = useState<AddressItemDTO|null>(null);

    const init = async () => {
        // Get order detail
        const id = param.get('id');
        if (id) {
            const res = await confirmOrder(id);
            setOrder(res);
            if (res) {
                setTotal(sum(res.items.map(e => e.price)));
            }
        } else {
            showErrorToast("Giá trị không hợp lệ");
        }

        // Get address data
        setListAddress(await getAddresses());
    }

    const updateQuantity = (bookId: string, value: number) => {
        setOrder(prev => ({
            ... prev!,
            items: prev!.items.map(e => 
                e.bookId == bookId ? { ... e, quantity: e.quantity + value } : e
            )
        }));
        const item = order!.items.find(e => e.bookId == bookId);
        setTotal(prev => prev + value * item!.price);
    } 

    const pay = async () => {
        const redirectUrl = await payOrder(order!.id, order!);
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }

    useEffect(() => {
        setLastAmount(total);
    }, [total]);

    useEffect(() => {
        if (order && order.addressId && listAddress.length > 0) {
            setPreviewAddress(listAddress.find(e => e.id == order.addressId) || null);
        }
    }, [order, listAddress]);

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    useEffect(() => {
        if (orderApiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [orderApiLoading]);

    return (
        <div className="order">
            { order && <>
                <div className="row ">
                    {/* Left */}
                    <div className="col-8 pe-0">
                        <div className="card card-body rounded-0 mt-2">
                            <h5 className="mb-3 ps-2">Đặt hàng</h5>
        
                            {/* Product list */}
                            <label className="label">Danh sách sản phẩm (2)</label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tên sách</th>
                                        <th style={{width: '100px'}}>Số lượng</th>
                                        <th style={{width: '120px'}}>Đơn giá</th>
                                        <th style={{width: '120px'}}>#</th>
                                    </tr>
                                </thead>
        
                                <tbody>
                                    { order.items.map(e => <>
                                        <tr>
                                            <td>{e.title}</td>
                                            <td>x{e.quantity}</td>
                                            <td>{e.price.toLocaleString('vn')} VNĐ</td>
                                            <td>
                                                <div className="d-flex change-action">
                                                    <i className={`bx bx-minus ${e.quantity <= 1? 'disabled':''}`} onClick={() => updateQuantity(e.bookId, -1)}></i>
                                                    <i className='bx bx-plus' onClick={() => updateQuantity(e.bookId, 1)}></i>
                                                    <i className='bx bx-trash-alt'></i>
                                                </div>
                                            </td>
                                        </tr>
                                    </>) }
                                </tbody>
                            </table>
        
                            {/* Voucher */}
                            <div className="label mt-3">Mã giảm giá <i style={{fontSize: '14px'}}>(* Lưu ý những mã cùng loại sẽ chỉ áp dụng mã cuối cùng được thêm)</i></div>
                            <div className="d-flex vouchers mt-2">
        
                                <div className="voucher me-2 d-flex">
                                    <div>KHUYEN MAI 15/1 </div>
                                    <i className='bx bx-x'></i></div>
        
                                <Button label="Thêm voucher" onClick={() => {}}></Button>
                            </div>
        
                            {/* Receiver Info */}
                            <div className="label mt-3 mb-2">Thông tin nhận hàng</div>
                            { previewAddress && <>
                                <div className="d-flex flex-column address p-2 position-relative">
                                    <div className="d-flex align-items-center">
                                        <i className='bx bx-user'></i>
                                        <div className="ms-2">{previewAddress.receiverName}</div>
                                        <i className='bx bx-phone ms-3'></i>
                                        <div className="ms-2">{previewAddress.phoneNumber}</div>
                                    </div>
            
                                    <div className="d-flex align-items-center">
                                        <i className='bx bx-home-alt'></i>
                                        <div className="ms-2 max-1-line">{previewAddress.detail}, {previewAddress.ward}, {previewAddress.district}, {previewAddress.city}</div>
                                    </div>
                                    
                                    
                                    <i className='bx bx-edit-alt change-address' title="Thay đổi địa chỉ" onClick={() => setShowChangeAddressDialog(true)}></i>
                                </div>
                            </> }

                            { !previewAddress && <>
                                <label className="mb-1">Bạn chưa thiết lập địa chỉ nhận hàng mặc định.</label>
                                <Button label="Thiết lập địa chỉ ngay" onClick={() => setShowChangeAddressDialog(true)}/>    
                            </> } 
                        </div>
                    </div>
        
                    {/* Right */}
                    <div className="col-4">
                        <div className="card card-body rounded-0 mt-2 position-sticky" style={{top: '70px'}}>
                            {/* Total */}
                            <div className="label">Chi tiết</div>
                            <table>
                                <tbody>

                                <tr>
                                    <th>Tổng cộng:</th>
                                    <td className="text-end">{total.toLocaleString('vn')}</td>
                                </tr>
                                <tr>
                                    <th>Phí vận chuyển:</th>
                                    <td className="text-end">--</td>
                                </tr>
                                <tr>
                                    <th>Khuyến mại:</th>
                                    <td className="text-end">--</td>
                                </tr>
                                <tr>
                                    <th>Voucher:</th>
                                    <td className="text-end">--</td>
                                </tr>
                                <tr>
                                    <th>Thanh toán:</th>
                                    <td className="text-end fw-bold fst-italic">{lastAmount.toLocaleString('vn')} VNĐ</td>
                                </tr>
                                </tbody>
                            </table>
                            
                            {/* Payment method */}
                            <label className="label mt-3">Hình thức thanh toán</label>
                            <select 
                                className="mt-2" 
                                style={{ width: 'fit-content' }} 
                                onChange={e => {
                                    if (e.target.value == 'CashOnDelivery')
                                        setOrder(prev => ({... prev!, paymentMethod: 'CashOnDelivery'}));
                                    else
                                        setOrder(prev => ({... prev!, paymentMethod: 'VNPay'}));
                                }}>
                                <option value="CashOnDelivery">(Trực tiếp) Thanh toán khi nhận hàng</option>
                                <option value="VNPay">(Online) Thanh toán qua VNPay</option>
                            </select>

                            <button className="mt-3" onClick={() => pay()}>
                                { order.paymentMethod === 'CashOnDelivery' ? 'Đặt hàng' : 'Thanh toán ngay' }
                            </button>

                        </div>
                    </div>
                </div>
            </> }

            {/* Select address dialog */}
            { showChangeAddressDialog && <>
                <div className="cover-bg">
                    <div className="card card-body col-6 p-2 pe-3 shadow-sm position-fixed translate-middle-x start-50" 
                    style={{top: '80px'}}>
                        <h5 className="text-center mb-0">Chọn địa chỉ</h5>
                        <div className="btn-close position-absolute end-0 top-0 m-2" onClick={() => setShowChangeAddressDialog(false)}></div>
                        <RadioGroup
                            defaultValue={order?.addressId}
                            name="radio-buttons-group">

                            { listAddress.map(e => <>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Radio value={e.id} onClick={() => {
                                        setPreviewAddress(e);
                                        setOrder(prev => ({... prev!, addressId: e.id}));
                                        setShowChangeAddressDialog(false);
                                    }} />
                                    <div className="d-flex flex-column address mt-2 p-2 position- flex-fill">
                                        <div className="d-flex align-items-center">
                                            <i className='bx bx-user'></i>
                                            <div className="ms-2">{e.receiverName}</div>
                                            <i className='bx bx-phone ms-3'></i>
                                            <div className="ms-2">{e.phoneNumber}</div>
                                        </div>
                
                                        <div className="d-flex align-items-center">
                                            <i className='bx bx-home-alt'></i>
                                            <div className="ms-2 max-1-line">{e.detail}, {e.ward}, {e.district}, {e.city}</div>
                                        </div>
                                    </div>
                                </div>
                            </>) }

                        </RadioGroup>

                        <div className="d-flex justify-content-center mb-2">
                            <Button className="mt-3" label="Xác nhận" pxWidth={120} pxSize={14} blackTheme onClick={() => {}}/>
                        </div>
                    </div>
                </div>
            </> }
        </div>
    );
}

export default Order;