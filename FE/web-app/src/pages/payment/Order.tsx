import React, { useEffect, useState } from "react";
import '../../styles/pages/Order.css'
import { useDispatch } from "react-redux";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { min, sum } from "lodash";
import { Radio, RadioGroup } from "@mui/material";
import { OrderDTO, PaymentMethod } from "../../types/order";
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from "../../stores";
import { OutletContextProp } from "../../types/base";
import { AddressItemDTO } from "../../types/user";
import { confirmOrder, getAddresses, payOrder } from "../../api";
import { showErrorToast, showInfoToast } from "../../utils";
import Button from "../../components/Button";
import { DiscountType, VoucherDetailDTO, VoucherStatus } from "../../types/voucher";
import { getVouchers } from "../../api/voucher";

export const Order = () => {
    const [ param ] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const appContext = useAppContext();
    const navigate = useNavigate();
    
    const [ order, setOrder ] = useState<OrderDTO|null>(null);
    const [ total, setTotal ] = useState<number>(0);
    const [ showChangeAddressDialog, setShowChangeAddressDialog ] = useState<boolean>(false);
    const [ listAddress, setListAddress ] = useState<AddressItemDTO[]>([]);
    const [ previewAddress, setPreviewAddress ] = useState<AddressItemDTO|null>(null);

    const [vouchers, setVouchers] = useState<VoucherDetailDTO[]>([]);
    const [showPickVoucher, setShowPickVoucher] = useState<boolean>(false);
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherDetailDTO|null>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    const init = async () => {
        // Get order detail
        const id = param.get('id');
        const res = await confirmOrder(id!);
        if (res.isSuccess) {
            setOrder(res.data!);
            if (res) {
                setTotal(sum(res.data!.items.map(e => e.price)));
            }
        } else {
            showErrorToast("Giá trị không hợp lệ");
        }

        // Get address data
        setListAddress((await getAddresses()).data!);

        initVouchers();
    }

    const caculateDiscountAmount = () => {
        if (!appliedVoucher) {
            setDiscountAmount(0);
            return;
        }

        if (appliedVoucher.discountType == DiscountType.Amount) {
            setDiscountAmount(Math.min(appliedVoucher.discount, total));
        } else {
            const d = Math.floor(appliedVoucher.discount / 100.0 * total);
            setDiscountAmount(Math.min(d, total, appliedVoucher.maxDiscount));
        }
    }

    const initVouchers = async () => {
        const res = await getVouchers({
            code: null,
            name: null,
            start: null,
            end: null,
            page: 1,
            size: 1000
        });
        if (res.isSuccess) {
            setVouchers(res.data!.data);
        }
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

    const checkIfUserAddedAddress = () => {
        if (listAddress.length == 0) {
            appContext!.showConfirmDialog({
                message: "Danh sách địa chỉ trống, bạn có muốn thiết lập địa chỉ không?",
                onReject: () => {},
                onConfirm: () => navigate('/account/address')
            });
            return
        }
        setShowChangeAddressDialog(true);
    };

    const pay = async () => {
        dispatch(startLoadingStatus());
        const res = (await payOrder(order!.id, order!));
        if (res.isSuccess) {
            window.location.href = `${res.data!}`;
        } else {
            showErrorToast(res.message!);
        }
        dispatch(endLoadingStatus());
    }

    useEffect(() => {
        if (order && order.addressId && listAddress.length > 0) {
            setPreviewAddress(listAddress.find(e => e.id == order.addressId) || null);
        }
    }, [order, listAddress]);

    useEffect(() => caculateDiscountAmount(), [appliedVoucher, total]);

    useEffect(() => {
        if(isApiReady) init();
    }, [isApiReady]);

    return (
        <div className="order">
            { order && <>
                <div className="row ">
                    {/* Left */}
                    <div className="col-8 pe-0">
                        <div className="card card-body rounded-0 mt-2">
                            <h5 className="mb-3 ps-2">Đặt hàng</h5>
        
                            {/* Product list */}
                            <label className="label">Danh sách sản phẩm ({order?.items.length || 0})</label>
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
                            <div className="label mt-3">Mã giảm giá <i style={{fontSize: '14px'}}></i></div>
                            <div className="d-flex vouchers mt-2">
        
                                { appliedVoucher && <>
                                    <div className="voucher me-2 d-flex">
                                        <div>{appliedVoucher.name} (-{
                                            appliedVoucher.discountType == DiscountType.Amount? 
                                                `${appliedVoucher.discount.toLocaleString()} VNĐ`:
                                                `${appliedVoucher.discount}%`
                                        })</div>
                                        <i className='bx bx-x' onClick={() => setAppliedVoucher(null)}></i>
                                    </div>
                                </> }
                                
                                { !appliedVoucher && <>
                                    <Button label="Chọn voucher" onClick={() => setShowPickVoucher(true)}></Button>
                                </> }

                                { showPickVoucher && <>
                                    <div className="position-fixed top-0 start-0 vh-100 vw-100 bg-secondary"
                                        style={{ zIndex: 2, opacity: 0.7 }}
                                    />

                                    <div className="card card-body position-fixed start-50 translate-middle-x"
                                        style={{ top: 100, width: 500, height: 600, zIndex: 3 }}
                                    >
                                        <h5>Chọn voucher</h5>
                                        <hr className="my-2" />

                                        <div className="vertical-scrollable">
                                            {vouchers.map(e => (<>
                                                <div key={e.id} className="d-flex flex-column opacity-hover" onClick={() => {
                                                    if (e.status != VoucherStatus.Effective) {
                                                        showInfoToast("Voucher chưa có hiệu lực/đã hết hạn");
                                                        return;
                                                    }
                                                    setOrder(prev => ({... prev!, voucherId: e.id}));
                                                    setAppliedVoucher(e);
                                                    setShowPickVoucher(false);
                                                }}>
                                                    <div className="fw-bold max-1-line">{e.name}</div>
                                                    <div className="d-flex justify-content-between">
                                                        <small className="fst-italic">{
                                                            e.discountType == DiscountType.Amount? 
                                                                `${e.discount.toLocaleString()} VNĐ`:
                                                                `${e.discount}%`
                                                        }</small>

                                                        <div style={{fontSize: 12}}>{
                                                            e.status == VoucherStatus.Created? `Còn lại ${e.remainingQuantity}/${e.quantity} - Chưa có hiệu lực`:
                                                            e.status == VoucherStatus.Effective? `Còn lại ${e.remainingQuantity}/${e.quantity} - Đang diễn ra`:
                                                            `Đã hết hạn`
                                                        }</div>
                                                    </div>
                                                </div>
                                                <hr className="my-1"/>
                                            </>))}
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <Button label="Hủy" onClick={() => setShowPickVoucher(false)} pxWidth={100}></Button>
                                        </div>
                                    </div>
                                </> }
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
                                <Button label="Thiết lập địa chỉ ngay" onClick={() => checkIfUserAddedAddress()}/>    
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
                                    <th>Giảm giá:</th>
                                    <td className="text-end">- {discountAmount.toLocaleString('vn')}</td>
                                </tr>
                                <tr>
                                    <th>Thanh toán:</th>
                                    <td className="text-end fw-bold fst-italic">{(total - discountAmount).toLocaleString('vn')} VNĐ</td>
                                </tr>
                                </tbody>
                            </table>
                            
                            {/* Payment method */}
                            <label className="label mt-3">Hình thức thanh toán</label>
                            <select 
                                value={order.paymentMethod}
                                className="mt-2" 
                                style={{ width: 'fit-content' }} 
                                onChange={e => {
                                    setOrder(prev => ({... prev!, paymentMethod: e.target.value as PaymentMethod}));
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

                        {/* <div className="d-flex justify-content-center mb-2">
                            <Button className="mt-3" label="Xác nhận" pxWidth={120} pxSize={14} blackTheme onClick={() => {}}/>
                        </div> */}
                    </div>
                </div>
            </> }
        </div>
    );
}