import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { current } from '@reduxjs/toolkit';
import { AppDispatch, Button, endLoadingStatus, formatDate, OutletContextProp, Pagination, showInfoToast, showSuccessToast, startLoadingStatus } from '../../../../shared';
import './PaymentHistory.css'
import { CancelOrderRequest, OrderHistoryListItemDTO, OrderStatus, PaymentMethod, PaymentStatus, useOrder } from '../../../../payment';
import { useDispatch } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup } from '@mui/material';

const cancelOrderReasons = [
    { value: 'Muốn thay đổi thông tin đặt hàng', label: 'Muốn thay đổi thông tin đặt hàng' },
    { value: 'Giá quá đắt', label: 'Giá quá đắt' },
    { value: 'Đổi ý không muốn mua nữa', label: 'Đổi ý không muốn mua nữa' },
    { value: '', label: 'Lý do khác:' },
];
  

export default function PaymentHistory() {
    const { orderApiLoading, getOrderHistory, cancelOrder } = useOrder();
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const navigate = useNavigate();
    
    const columns: GridColDef[] = [
        { 
            field: 'id', 
            headerName: 'Mã đơn hàng', 
            type: 'string', 
            width: 180, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell(params) {
                return <Link to={`detail?id=${params.row.id}`} className='action-text'>{params.row.id}</Link>
            },
        },
        { 
            field: 'updatedAt', 
            headerName: 'Cập nhật',
            width: 160, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell(params) {
                return <>{formatDate(params.row.updatedAt, 'dd/MM/yyyy HH:mm:ss')}</>;
            },
        },
        { 
            field: 'totalAmount', 
            headerName: 'Tổng tiền', 
            type: 'number', 
            width: 100, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false 
        },
        { 
            field: 'currency', 
            headerName: 'Đơn vị', 
            type: 'string', 
            width: 70, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false 
        },
        { 
            field: 'orderStatus', 
            headerName: 'Trạng thái đơn hàng', 
            type: 'string',
            width: 150, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            align: 'center',
            renderCell: (params) => {
                const status = params.row.orderStatus as OrderStatus;
                if (status == 'Created') return <>Chưa gửi</>;
                if (status == 'Placed') return <>Chờ xác nhận</>;
                if (status == 'Accepted') return <>Đã xác nhận</>;
                if (status == 'InProgress') return <>Đang đóng gói</>;
                if (status == 'Shipping') return <>Đang vận chuyển</>;
                if (status == 'Delivered') return <>Đã giao</>;
                if (status == 'Cancelled') return <>Đã hủy</>;
            }
        },
        { 
            field: 'paymentStatus', 
            headerName: 'Trạng thái thanh toán', 
            type: 'string',
            width: 160, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            align:"center",
            renderCell(params) {
                const status = params.row.paymentStatus as PaymentStatus;
                if (status == 'Unpaid') return <span className='gray-tag'>Chưa thanh toán</span>
                if (status == 'Paid') return <span className='green-tag'>Đã thanh toán</span>
                if (status == 'Failed') return <span className='red-tag'>Thanh toán lỗi</span>
            },
        },
        { 
            field: 'paymentMethod', 
            headerName: 'Phương thức thanh toán', 
            type: 'string',
            width: 180, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            align:"center",
            renderCell(params) {
                const status = params.row.paymentMethod as PaymentMethod;
                if (status == 'CashOnDelivery') return <>Thanh toán khi nhận hàng</>
                if (status == 'VNPay') return <>Thanh toán qua VNPay</>
            },
        },
        { 
            field: 'action', 
            headerName: 'Tùy chọn',
            width: 240,
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell: (params) => {
                const orderStatus = params.row.orderStatus as OrderStatus;
                const paymentMethod = params.row.paymentMethod as PaymentMethod;
                const actions = [];

                if (orderStatus == 'Created' || orderStatus == 'Placed' || orderStatus == 'Accepted' || orderStatus == 'InProgress') {
                    actions.push(<Button label='Hủy đơn hàng' className='me-2' pxHeight={20} onClick={() => setCancelData({
                        orderId: params.row.id,
                        reason: cancelOrderReasons[0].value
                    })}/>);
                }
                if (orderStatus == 'Created') {
                    actions.push(<Button label='Tiếp tục thiết lập' className='me-2' pxHeight={20} onClick={() => navigate('/order?id=' + params.row.id)}/>);
                }

                const paymentStatus = params.row.paymentStatus as PaymentStatus;
                if (paymentMethod == 'VNPay' && orderStatus != 'Created' && orderStatus != 'Cancelled' &&  paymentStatus == 'Unpaid') {
                    actions.push(<Button label='Thanh toán ngay' className='me-2' blackTheme pxHeight={20} onClick={() => {}}/>);
                }

                return (
                    <div className='d-flex h-100 align-items-center'>
                        {actions}
                    </div>
                );
            }
        },
    ];

    const [orders, setOrders ] = useState<OrderHistoryListItemDTO[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(5);
    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [cancelData, setCancelData] = useState<CancelOrderRequest|null>(null);
    const otherReasonRef = React.useRef<HTMLTextAreaElement>(null);

    const load = async () => {
        const res = await getOrderHistory(page, size);
        if (res) {
            setOrders(res.data);
            setTotalRecord(res.totalRecord);
            setTotalPage(res.totalPage);
        }
    }

    const requestCancelOrder = async () => {
        if (!cancelData!.reason) {
            cancelData!.reason = otherReasonRef.current!.value;
        }
        const result = await cancelOrder(cancelData!);
        if (result) {
            showSuccessToast(result, 3000);
            setCancelData(null);
            load();
        }
    }

    useEffect(() => {
        if(isApiReady) load();
    }, [isApiReady, page]);

    useEffect(() => {
        if (orderApiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [orderApiLoading]);

    return (
        <div className='payment-history'>
            <h5>Danh sách đơn hàng</h5>
            <small className='fst-italic'>(Ấn vào mã đơn hàng để xem chi tiết)</small>
            <div className='card card-body rounded-0 shadow-sm mt-1 p-0'>
                <DataGrid
                    rows={orders}
                    columns={columns}
                    columnHeaderHeight={28}
                    hideFooter
                    sx={{ border: 0 }}
                />
            </div>
            { orders.length > 0 && <>
                <div className='d-flex justify-content-center my-3'>
                    <Pagination page={page} total={totalPage} onPageChange={p => setPage(p)}/>
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
                                    key={e.value}
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

        </div>
    );
}