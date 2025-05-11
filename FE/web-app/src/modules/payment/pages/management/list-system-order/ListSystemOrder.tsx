import React, { useEffect, useState } from "react";
import { OrderHistoryListItemDTO, OrderStatus, PaymentMethod, PaymentStatus, SystemOrdersDTO, SystemOrderSearchDTO, useOrder } from "../../..";
import { AppDispatch, Button, endLoadingStatus, formatDate, OutletContextProp, Pagination, showSuccessToast, startLoadingStatus } from "../../../../shared";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import './ListSystemOrder.css';
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

type TimeOption = 'Custom'|'Today'|'ThisWeek'|'ThisMon';

const ListSystemOrder = () => {
    const { orderApiLoading, getSystemOrders, updateOrderStatus } = useOrder();
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();
    const [ params, setParam ] = useSearchParams();

    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(20);
    const [filterStatus, setFilterStatus] = useState<OrderStatus|'--'>(
        params.get('status') as OrderStatus ?? 'Placed');
    const [startDate, setStartDate] = useState<Date>(startOfDay(new Date));
    const [endDate, setEndDate] = useState<Date>(endOfDay(new Date));
    const [data, setData] = useState<SystemOrdersDTO|null>(null);
    const [timeOption, setTimeOption] = useState<TimeOption>(
        params.get('time') as TimeOption ?? 'Today');

    const load = async () => {
        setData(await getSystemOrders({
            page, size, 
            status: filterStatus == '--'? null: filterStatus,
            startDate,
            endDate
        }));
    }

    const setOrderStatus = async (orderId: string, status: OrderStatus) => {
        if (await updateOrderStatus(orderId, status)) {
            showSuccessToast("Cập nhật trạng thái đơn hàng thành công.");   
            load();
        }
    }

    useEffect(() => {
        if(isApiReady) load();
        setParam({ 
            time: timeOption,
            status: filterStatus != '--'? filterStatus:''
        });
    }, [isApiReady, page, filterStatus, startDate, endDate, timeOption]);

    useEffect(() => {
        if (orderApiLoading) dispatch(startLoadingStatus());
        else dispatch(endLoadingStatus());
    }, [orderApiLoading]);

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
                return <Link to={`/account/payment-history/detail?id=${params.row.id}`} className='action-text'>{params.row.id}</Link>
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
                if (status == 'Accepted') return <>Chờ xử lý</>;
                if (status == 'InProgress') return <>Đang xử lý</>;
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
            renderCell(params) {
                const status = params.row.paymentMethod as PaymentMethod;
                if (status == 'CashOnDelivery') return <>Thanh toán khi nhận hàng</>
                if (status == 'VNPay') return <>Thanh toán qua VNPay</>
            },
        },
        { 
            field: 'action', 
            headerName: 'Hành động', 
            type: 'string',
            width: 160, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            align:"center",
            renderCell(params) {
                const orderStatus = params.row.orderStatus as OrderStatus;
                const actions = [];

                if (orderStatus == 'Placed') {
                    actions.push(<Button label='Xác nhận đơn hàng' blackTheme className='me-2' 
                        pxHeight={24} onClick={() => setOrderStatus(params.row.id, 'Accepted')}/>);
                }

                if (orderStatus == 'Accepted') {
                    actions.push(<Button label='Đang xử lý' blackTheme className='me-2' 
                        pxHeight={24} onClick={() => setOrderStatus(params.row.id, 'InProgress')}/>);
                }

                if (orderStatus == 'InProgress') {
                    actions.push(<Button label='Đã bàn giao cho ĐVVC' blackTheme className='me-2' 
                        pxHeight={24} onClick={() => setOrderStatus(params.row.id, 'Shipping')}/>);
                }

                if (orderStatus == 'Shipping') {
                    actions.push(<Button label='Giao hàng thành công' blackTheme className='me-2' 
                        pxHeight={24} onClick={() => setOrderStatus(params.row.id, 'Delivered')}/>);
                }

                return (
                    <div className='d-flex h-100 align-items-center'>
                        {actions}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="list-system-order">

            <div className="d-flex mt-2">
                {/* Status */}
                <FormControl className="me-2" size="small" sx={{width: '200px'}}>
                    <InputLabel id="status-select">Trạng thái</InputLabel>
                    <Select
                        sx={{ padding: '0px' }}
                        labelId="status-select"
                        value={filterStatus}
                        label="Trạng thái"
                        onChange={e => setFilterStatus(e.target.value as OrderStatus|'--')}
                    >
                        <MenuItem value={'--'}>Tất cả</MenuItem>
                        <MenuItem value={'Placed'}>Chờ xác nhận</MenuItem>
                        <MenuItem value={'Accepted'}>Chờ xử lý</MenuItem>
                        <MenuItem value={'InProgress'}>Đang xử lý</MenuItem>
                        <MenuItem value={'Shipping'}>Đang vận chuyển</MenuItem>
                        <MenuItem value={'Delivered'}>Giao thành công</MenuItem>
                        <MenuItem value={'Cancelled'}>Đã hủy</MenuItem>
                    </Select>
                </FormControl>

                {/* Time */}
                <FormControl className="me-2" size="small" sx={{width: '200px'}}>
                    <InputLabel id="status-select">Thời gian</InputLabel>
                    <Select
                        sx={{ padding: '0px' }}
                        labelId="status-select"
                        value={timeOption}
                        label="Trạng thái"
                        onChange={e => {
                            debugger
                            const val = e.target.value as TimeOption;
                            setTimeOption(val);
                            if (val == 'ThisMon') {
                                setStartDate(startOfDay(startOfMonth(new Date())));
                            } else if (val == 'ThisWeek') {
                                setStartDate(startOfDay(startOfWeek(new Date())));
                            } else if (val == 'Today') {
                                setStartDate(startOfDay(new Date()));
                                setEndDate(new Date());
                            }
                        }}
                    >
                        <MenuItem value={'Custom'}>Tùy chọn</MenuItem>
                        <MenuItem value={'Today'}>Hôm nay</MenuItem>
                        <MenuItem value={'ThisWeek'}>Tuần này</MenuItem>
                        <MenuItem value={'ThisMon'}>Tháng này</MenuItem>
                    </Select>
                </FormControl>

                { timeOption == 'Custom' && <>
                    <FormControl className="me-2">
                        <DatePicker
                            label="Ngày bắt đầu"
                            value={startDate}
                            onChange={d => {
                                setStartDate(startOfDay(d!));
                            }}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </FormControl>

                    <FormControl className="me-2">
                        <DatePicker
                            label="Ngày kết thúc"
                            value={endDate}
                            onChange={d => setEndDate(d!)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </FormControl>
                </> }

            </div>


            { data && <>

                <div className="d-flex my-2">
                    <label className="fw-light">Tổng số đơn hàng: </label>
                    <b className="mx-2">{ data.totalRecord }</b>
                </div>

                <div className="d-flex my-2">
                    <div className="fw-lighter">Tổng giá trị: </div>
                    <b className="mx-2">{ data.totalOrderAmount.toLocaleString('vn') }</b>
                </div>

                <div className="d-flex my-2">
                    <div className="fw-light">Đã thanh toán: </div>
                    <b className="mx-2">{ data.totalPaidAmount.toLocaleString('vn') }</b>
                </div>

                <div className='card card-body rounded-0 shadow-sm p-0'>
                    <DataGrid
                        rows={data.data}
                        columns={columns}
                        columnHeaderHeight={28}
                        hideFooter
                        sx={{ border: 0 }}
                    />
                </div>
                <div className='d-flex justify-content-center my-3'>
                    <Pagination page={page} total={data.totalPage} onPageChange={p => setPage(p)}/>
                </div>
            </> }
        </div>
    );
}

export default ListSystemOrder;