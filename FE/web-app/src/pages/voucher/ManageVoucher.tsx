import React, { useEffect, useState } from "react";
import '../../styles/pages/ManageVoucher.css';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Pagination from "../../components/Pagination";
import { DiscountType, SearchVoucherDTO, VoucherDetailDTO, VoucherStatus } from "../../types/voucher";
import { changeActivationVoucher, deleteVoucher, getVouchers } from "../../api/voucher";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showInfoToast, showSuccessToast } from "../../utils";
import { useDispatch } from "react-redux";
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from "../../stores";

const ManageVoucher = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const context = useAppContext();

    const [page, setPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(5);
    
    // Search state
    const [searchCode, setSearchCode] = useState<string>('');
    const [searchKey, setSearchKey] = useState<string>('');
    const [searchStartDate, setSearchStartDate] = useState<string>('');
    const [searchEndDate, setSearchEndDate] = useState<string>('');

    // data
    const [vouchers, setVouchers] = useState<VoucherDetailDTO[]>([]);

    const columns: GridColDef[] = [
        { 
            field: 'stt', 
            headerName: 'STT', 
            width: 50,
            renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1 + (page - 1) * 10
        },
        { 
            field: 'code', 
            headerName: 'Mã', 
            width: 100,
            renderCell: (params) => (
                <div className="d-flex align-items-center">
                    <i 
                        className='bx bx-copy pointer-hover' 
                        onClick={() => {
                            navigator.clipboard.writeText(params.value);
                            showInfoToast("Đã sao chép mã code Voucher");
                        }}
                        title="Copy mã"
                    ></i>
                    <span className="ms-2">{params.value}</span>
                </div>
            )
        },
        { field: 'name', headerName: 'Tên', width: 180 },
        { field: 'isActive', headerName: 'Kích hoạt', width: 100, renderCell: (params) => {
            if (params.value == true) {
                return <i className='bx bx-check-circle text-success fs-5'></i> ;
            }
            return <i className='bx bx-lock fs-5 text-danger'></i>;
        } },
        { 
            field: 'discount', 
            headerName: 'Mức giảm', 
            width: 130,
            renderCell: (params) => {
                const value = params.row.discount;
                const type = params.row.discountType;

                if (type === DiscountType.Percentage) {
                    return `${value}%`;
                } else {
                    return `${value.toLocaleString()} VNĐ`;
                }
            }
        },
        { 
            field: 'maxDiscount', 
            headerName: 'Giảm tối đa', 
            width: 130,
            renderCell: (params) => `${params.value.toLocaleString('vi-VN')} VNĐ`
        },
        { 
            field: 'quantity', 
            headerName: 'Số lượng', 
            width: 100,
            renderCell: (params) => `${params.row.remainingQuantity}/${params.row.quantity}`
        },
        { 
            field: 'validFrom', 
            headerName: 'Có hiệu lực', 
            width: 150,
            renderCell: (params) => new Date(params.value).toLocaleString('vi-VN')
        },
        { 
            field: 'validUntil', 
            headerName: 'Hết hạn', 
            width: 150,
            renderCell: (params) => {
                const str = new Date(params.value).toLocaleString('vi-VN');
                
                return str;
            }
        },
        { 
            field: 'status', 
            headerName: 'Trạng thái', 
            width: 100,
            renderCell: (params) => {
                if (params.row.status == VoucherStatus.Created) {
                    return <span className="badge bg-warning text-dark">Chờ</span>;
                }
                if (params.row.status == VoucherStatus.Effective) {
                    return <span className="badge bg-success">Đang diễn ra</span>;
                }
                if (params.row.status == VoucherStatus.Expired) {
                    return <span className="badge bg-secondary">Hết hạn</span>;
                }
            }
        },
        {
            field: '',
            headerName: 'Tùy chọn',
            width: 100,
            sortable: false,
            filterable: false,
            disableExport: true,
            renderCell: (params) => (
                <div className="dropdown">
                    <i className='bx bx-dots-vertical-rounded' data-bs-toggle="dropdown"></i>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li className="dropdown-item py-0" onClick={() => handleToggleLock(params.row)}>
                            {!params.row.isActive ? 'Mở khóa voucher' : 'Khóa voucher'}
                        </li>

                        <li className="dropdown-item py-0" onClick={() => handleDeleteVoucher(params.row)}>
                            Xóa voucher
                        </li>
                    </ul>
                </div>
            )
        }
    ];

    useEffect(() => {
        load();
    }, [page]);

    const load = async () => {
        dispatch(startLoadingStatus());
        const request: SearchVoucherDTO = {
            code: searchCode,
            name: searchKey,
            start: searchStartDate ? new Date(searchStartDate) : null,
            end: searchEndDate ? new Date(searchEndDate) : null,
            pageIndex: page,
            pageSize: 20
        };
        
        const res = await getVouchers(request);
        if (res.isSuccess) {
            setVouchers(res.data!.items);
            setTotalPage(res.data!.totalPages);
        } else {
            showErrorToast(res.message || "Load dữ liệu thất bại");
        }
        dispatch(endLoadingStatus());
    };

    const handleSearch = () => {
        setPage(1);
        load();
    };

    const handleResetSearch = () => {
        setSearchKey('');
        setSearchStartDate('');
        setSearchEndDate('');
        setSearchCode('');
        handleSearch();
    };

    const handleToggleLock = async (voucher: VoucherDetailDTO) => {
        dispatch(startLoadingStatus());
        const res = await changeActivationVoucher(voucher.id);
        if (res.isSuccess) {
            showSuccessToast(res.message || "Tác vụ thành công");
            load();
        } else {
            showErrorToast(res.message || "Tác vụ thất bại");
        }
        dispatch(endLoadingStatus());
    };

    const handleDeleteVoucher = async (voucher: VoucherDetailDTO) => {
        context?.showConfirmDialog({
            message: `Bạn chắc chắn muốn xóa voucher "${voucher.name}"?`,
            onConfirm: async () => {
                dispatch(startLoadingStatus());
                const res = await deleteVoucher(voucher.id);
                if (res.isSuccess) {
                    showSuccessToast(res.message || "Tác vụ thành công");
                    load();
                } else {
                    showErrorToast(res.message || "Tác vụ thất bại");
                }
                dispatch(endLoadingStatus());
            },
            onReject: () => {}
        })
    };

    return (
        <div className="manage-voucher">
            <div className="card card-body rounded-0 mb-3">
                <h5 className="mb-3">
                    <i className='bx bx-gift'></i> Quản lý Voucher
                </h5>

                {/* Search Section */}
                <div className="search-section mb-3">
                    <h6>Tìm kiếm</h6>
                    <div className="row">
                        <div className="col-md-4 mb-2">
                            <label className="form-label">Mã voucher</label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Nhập mã voucher"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 mb-2">
                            <label className="form-label">Tên voucher</label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Nhập tên voucher"
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 mb-2">
                            <label className="form-label">Thời điểm bắt đầu</label>
                            <input 
                                type="date" 
                                className="form-control"
                                value={searchStartDate}
                                onChange={(e) => setSearchStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 mb-2">
                            <label className="form-label">Thời điểm kết thúc</label>
                            <input 
                                type="date" 
                                className="form-control"
                                value={searchEndDate}
                                onChange={(e) => setSearchEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 mb-2 d-flex align-items-end">
                            <button 
                                className="btn btn-dark me-2"
                                onClick={handleSearch}
                            >
                                <i className='bx bx-search'></i> Tìm kiếm
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={handleResetSearch}
                            >
                                <i className='bx bx-reset'></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <button 
                        className="btn btn-success"
                        onClick={() => navigate('/admin/voucher/create')}
                    >
                        <i className='bx bx-plus'></i> Tạo mới voucher
                    </button>
                </div>

                {/* Voucher List */}
                <div style={{ height: 800, width: '100%' }}>
                    <DataGrid
                        rows={vouchers}
                        columns={columns}
                        hideFooter
                        disableRowSelectionOnClick
                        sx={{
                            fontSize: '0.75rem',
                            '& .MuiDataGrid-cell': {
                                fontSize: '0.75rem',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                fontSize: '0.75rem',
                            },
                        }}
                    />
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center mt-3">
                    <Pagination 
                        page={page} 
                        total={totalPage}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                </div>
            </div>
        </div>
    );
}

export default ManageVoucher;
