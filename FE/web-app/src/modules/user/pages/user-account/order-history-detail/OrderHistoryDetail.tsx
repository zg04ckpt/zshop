import React, { useEffect, useState } from "react";
import './OrderHistoryDetail.css';
import { useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { CancelOrderRequest, OrderHistoryDetailDTO, OrderStatus, PaymentMethod, PaymentStatus, useOrder } from "../../../../payment";
import { useDispatch } from "react-redux";
import { AppDispatch, OutletContextProp, startLoadingStatus, endLoadingStatus, formatDate, Button, showSuccessToast } from "../../../../shared";
import { DataGrid } from "@mui/x-data-grid";
import { isAdmin, useAuth } from "../../../../auth";
import { useUser } from "../../../hooks/useUser";
import { Dialog, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Step, StepLabel, Stepper } from "@mui/material";
import { SelectBookFromOrderToReviewDialog } from "../../../../book";

const orderSteps = [
    'Đã tạo', 
    'Chờ người bán xác nhận', 
    'Đã được xác nhận',
    'Chờ xử lý / đóng gói',
    'Đang vận chuyển',
    'Giao hàng thành công',
    'Đã hủy'
];

const cancelOrderReasons = [
    { value: 'Muốn thay đổi thông tin đặt hàng', label: 'Muốn thay đổi thông tin đặt hàng' },
    { value: 'Giá quá đắt', label: 'Giá quá đắt' },
    { value: 'Đổi ý không muốn mua nữa', label: 'Đổi ý không muốn mua nữa' },
    { value: '', label: 'Lý do khác:' },
];

const OrderHistoryDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const { orderApiLoading, getOrderHistoryDetail, cancelOrder } = useOrder();
    const navigate = useNavigate();
    const [param] = useSearchParams();

    const [orderId, setOrderId] = useState<string|null>(null);
    const [detail, setDetail] = useState<OrderHistoryDetailDTO|null>(null);
    const [currentOrderStep, setCurrentOrderStep] = useState<number>(0);
    const [cancelData, setCancelData] = useState<CancelOrderRequest|null>(null);
    const otherReasonRef = React.useRef<HTMLTextAreaElement>(null);
    const [reviewOrderId, setReviewOrderId] = useState<string|null>(null);
    const [showSelectBookToReview, setShowSelectBookToReview] = useState<boolean>(false);

    const init = async () => {
        const id = param.get('id');
        setOrderId(id);
        if (id) {
            setDetail(await getOrderHistoryDetail(id));
        }
    }

    const getOrderStatus = (status: OrderStatus) => {
        if (status == 'Created') return <>Chưa gửi</>;
        if (status == 'Placed') return <>Chờ xác nhận</>;
        if (status == 'Accepted') return <>Đã xác nhận</>;
        if (status == 'InProgress') return <>Đang đóng gói</>;
        if (status == 'Shipping') return <>Đang vận chuyển</>;
        if (status == 'Delivered') return <>Đã giao</>;
        if (status == 'Cancelled') return <>Đã hủy</>;
    }

    const getPaymentStatus = (status: PaymentStatus) => {
        if (status == 'Unpaid') return <span className='gray-tag'>Chưa thanh toán</span>
        if (status == 'Paid') return <span className='green-tag'>Đã thanh toán</span>
        if (status == 'Failed') return <span className='red-tag'>Thanh toán lỗi</span>
    }

    const getPaymentMethod = (status: PaymentMethod) => {
        if (status == 'CashOnDelivery') return <>Thanh toán khi nhận hàng</>
        if (status == 'VNPay') return <>Thanh toán qua VNPay</>
    }

    const getAction =  () => {
        const orderStatus = detail!.orderStatus;
        const paymentMethod = detail!.paymentMethod;
        const paymentStatus = detail!.paymentStatus;
        const actions = [];

        if (orderStatus == 'Created' || orderStatus == 'Placed' || orderStatus == 'Accepted' || orderStatus == 'InProgress') {
            actions.push(<Button label='Hủy đơn hàng' className='me-2' pxHeight={20} onClick={() => setCancelData({
                orderId: detail!.id,
                reason: cancelOrderReasons[0].value
            })}/>);
        }
        if (orderStatus == 'Created') {
            actions.push(<Button label='Tiếp tục thiết lập' className='me-2' pxHeight={20} onClick={() => navigate('/order?id=' + detail!.id)}/>);
        }

        if (paymentMethod == 'VNPay' && orderStatus != 'Created' && orderStatus != 'Cancelled' &&  paymentStatus == 'Unpaid') {
            actions.push(<Button label='Thanh toán ngay' className='me-2' blackTheme pxHeight={20} onClick={() => {}}/>);
        }

        if (orderStatus == 'Delivered') {
            actions.push(<Button label='Đánh giá đơn hàng' className='me-2' pxHeight={20} onClick={() => {
                setReviewOrderId(detail!.id);
                setShowSelectBookToReview(true);
            }}/>);
        }

        return (
            <div className='d-flex mt-5 justify-content-center'>
                {actions}
            </div>
        );
    }

    const requestCancelOrder = async () => {
        if (!cancelData!.reason) {
            cancelData!.reason = otherReasonRef.current!.value;
        }
        const result = await cancelOrder(cancelData!);
        if (result) {
            showSuccessToast(result, 3000);
            setCancelData(null);
            init();
        }
    }

    useEffect(() => {
        if (orderApiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [orderApiLoading]);

    useEffect(() => {
        if(isApiReady) {
            init()
        }
    }, [isApiReady]);

    useEffect(() => {
        if (detail) {
            if (detail.orderStatus == 'Created')
                setCurrentOrderStep(0);
            else if (detail.orderStatus == 'Placed')
                setCurrentOrderStep(1);
            else if (detail.orderStatus == 'Accepted')
                setCurrentOrderStep(2);
            else if (detail.orderStatus == 'InProgress')
                setCurrentOrderStep(3);
            else if (detail.orderStatus == 'Shipping')
                setCurrentOrderStep(4);
            else if (detail.orderStatus == 'Delivered')
                setCurrentOrderStep(5);
            else
                setCurrentOrderStep(6);
        }
    }, [detail]);       

    return (
        <div className="order-history-detail">
            <h5>Chi tiết đơn hàng</h5>
            <div className="d-flex align-items-center mb-2">
                <Button label="Quay lại" onClick={() => navigate(-1)} icon={
                    <i className="fas fa-arrow-left me-1"></i>
                }/>
            </div>
            { detail && <>
                <div className="card card-body rounded-0">
                    <table>
                        <tbody>
                            { isAdmin() && <>
                                <tr>
                                    <th>Tài khoản thanh toán:</th>
                                    <td>{ detail.userId }</td>
                                </tr>
                            </> }
                            <tr>
                                <th>Mã đơn hàng:</th>
                                <td>{orderId}</td>
                            </tr>
                            <tr>
                                <th>Tạo lúc:</th>
                                <td>{formatDate(detail.orderDate, 'HH:mm:ss dd-MM-yyyy')}</td>
                            </tr>
                            <tr>
                                <th>Cập nhật:</th>
                                <td>{formatDate(detail.updatedAt, 'HH:mm:ss dd-MM-yyyy')}</td>
                            </tr>

                            <tr>
                                <th>Trạng thái thanh toán:</th>
                                <td>{getPaymentStatus(detail.paymentStatus)}</td>
                            </tr>
                            <tr>
                                <th>Hình thức thanh toán:</th>
                                <td>{getPaymentMethod(detail.paymentMethod)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <label className="fw-bold mt-2 mb-3">Trạng thái đơn hàng:</label>
                    <Stepper activeStep={currentOrderStep} alternativeLabel>
                        { orderSteps.map((label, index) => (
                            <Step key={label}>
                            <StepLabel optional={index != 0 && index != 6}>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <label className="fw-bold mt-3">Địa chỉ nhận hàng:</label>
                    { detail.address && <>
                        <div className="d-flex flex-column address p-2 position-relative">
                            <div className="d-flex align-items-center">
                                <i className='bx bx-user'></i>
                                <div className="ms-2">{detail.address.receiverName}</div>
                                <i className='bx bx-phone ms-3'></i>
                                <div className="ms-2">{detail.address.phoneNumber}</div>
                            </div>

                            <div className="d-flex align-items-center">
                                <i className='bx bx-home-alt'></i>
                                <div className="ms-2 max-1-line">{detail.address.detail}, {detail.address.ward}, {detail.address.district}, {detail.address.city}</div>
                            </div>
                        </div>
                    </> }

                    <label className="fw-bold">Chi tiết:</label>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên sách</th>
                                <th style={{width: '100px'}}>Số lượng</th>
                                <th style={{width: '120px'}}>Đơn giá</th>
                            </tr>
                        </thead>

                        <tbody>
                            { detail.items.map(e => <>
                                <tr>
                                    <td><a onClick={() => navigate('/book?id=' + e.bookId)}   className="action-text">{e.title}</a></td>
                                    <td>x{e.quantity}</td>
                                    <td>{e.price.toLocaleString('vn')} VNĐ</td>
                                </tr>
                            </>) }
                        </tbody>
                    </table>
                    <div className="d-flex w-100 pe-4">
                        <div className="flex-fill"></div>
                        <label htmlFor="">Tổng tiền:</label>
                        <div className="fw-bolder mx-2">{detail.totalAmount.toLocaleString('vn')} {detail.currency}</div>
                    </div>

                    { getAction() }
                </div>
            </> }

            {/* Cancel order confirm dialog */}
            { cancelData && <>
                <Dialog 
                    onClose={() => {}} open={true}
                    sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                    maxWidth="xs"
                >
                    <DialogTitle fontSize={16} textAlign={'center'}>Hủy đơn hàng {cancelData.orderId}</DialogTitle>
                    <DialogContent dividers>
                        <div className='mb-2 fw-light'>Vui lòng cung cấp nguyên nhân hủy đơn hàng</div>
                        <RadioGroup
                            // ref={radioGroupRef}
                            aria-label="ringtone"
                            name="ringtone"
                            value={cancelData.reason}
                            onChange={e => setCancelData(prev => ({... prev!, reason: e.target.value}))}
                        >
                            {cancelOrderReasons.map((e) => (
                                <FormControlLabel
                                    value={e.value}
                                    control={<Radio />}
                                    label={e.label}
                                />
                            ))}
                        </RadioGroup>
                        { !cancelData.reason && <>
                            <textarea ref={otherReasonRef}
                                rows={4} className='form-control' placeholder="Mô tả lý do"></textarea>
                        </> }
                        <div className='d-flex justify-content-center mt-3'>
                            <Button label='Giữ lại đơn hàng' className='me-2' onClick={() => setCancelData(null)}/>
                            <Button label='Xác nhận hủy' blackTheme onClick={() => requestCancelOrder()}/>
                        </div>
                    </DialogContent>
                </Dialog>
            </> }


            { reviewOrderId && <>
                <SelectBookFromOrderToReviewDialog 
                    orderId={reviewOrderId} 
                    open={showSelectBookToReview} 
                    onClose={() => setShowSelectBookToReview(false)}/>
            </> }
        </div>
    );
}

export default OrderHistoryDetail;