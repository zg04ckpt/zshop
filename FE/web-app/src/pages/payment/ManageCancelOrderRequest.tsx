import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import '../../styles/pages/ManageCancelOrderRequest.css';
import { AppDispatch, startLoadingStatus, endLoadingStatus } from "../../stores";
import { OutletContextProp } from "../../types/base";
import { CancelOrderRequestListItemDTO } from "../../types/order";
import { formatDate } from "../../utils/helper";
import Button from "../../components/Button";
import { acceptOrRejectCancelOrderRequest, getAllCancelOrderRequests } from "../../api";
import { showSuccessToast } from "../../utils";

export const ManageCancelOrderRequest = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { isApiReady } = useOutletContext<OutletContextProp>();

    const [requests, setRequests] = useState<CancelOrderRequestListItemDTO[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalRecord, setTotalRecord] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);

    const columns: GridColDef[] = [
        { 
            field: 'orderId', 
            headerName: 'Mã đơn hàng', 
            type: 'string', 
            width: 180, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell(params) {
                return <Link to={`detail?id=${params.row.orderId}`} className='action-text'>{params.row.orderId}</Link>
            },
        },
        { 
            field: 'createdAt', 
            headerName: 'Tạo lúc',
            width: 160, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell(params) {
                return <>{formatDate(params.row.createdAt, 'dd/MM/yyyy HH:mm:ss')}</>;
            },
        },
        { 
            field: 'amount', 
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
            field: 'reason', 
            headerName: 'Lý do hủy', 
            type: 'string',
            width: 400, 
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
        },
        { 
            field: 'action', 
            headerName: 'Tùy chọn',
            width: 240,
            disableColumnMenu: true, 
            sortable: false, 
            resizable: false,
            renderCell: (params) => {

                return (
                    <div className='d-flex h-100 align-items-center'>
                        <Button label='Chấp nhận' blackTheme className='me-2' pxHeight={20} onClick={() => accept(params.row.id)}/>
                        <Button label='Từ chối' className='me-2' pxHeight={20} onClick={() => reject(params.row.id)}/>
                    </div>
                );
            }
        },
    ];

    const load = async () => {
        dispatch(startLoadingStatus());
        const res = await getAllCancelOrderRequests(page);
        if (res.isSuccess) {
            setRequests(res.data!.items);
            setTotalRecord(res.data!.totalItems);
            setTotalPage(res.data!.totalPages);
        }
        dispatch(endLoadingStatus());
    }

    const accept = async (id: number) => {
        dispatch(startLoadingStatus());
        if ((await acceptOrRejectCancelOrderRequest(id, true)).isSuccess) {
            showSuccessToast('Đã hủy đơn hàng');
            setRequests(pre => pre.filter(e => e.id != id));
        }
        dispatch(endLoadingStatus());
    }

    const reject = async (id: number) => {
        dispatch(startLoadingStatus());
        if ((await acceptOrRejectCancelOrderRequest(id, false)).isSuccess) {
            showSuccessToast('Đã từ chối hủy đơn hàng');
            setRequests(pre => pre.filter(e => e.id != id));
        }
        dispatch(endLoadingStatus());
    }

    useEffect(() => {
        if(isApiReady) load();
    }, [isApiReady, page]);

    // useEffect(() => {
    //     if (orderApiLoading) dispatch(startLoadingStatus());
    //     else dispatch(endLoadingStatus());
    // }, [orderApiLoading]);

    return (
        <div className="list-cancel-order-request">
            <div className='card card-body rounded-0 shadow-sm p-0'>
                <DataGrid
                    rows={requests}
                    columns={columns}
                    columnHeaderHeight={28}
                    hideFooter
                    sx={{ border: 0 }}
                />
            </div>
        </div>
    );
}