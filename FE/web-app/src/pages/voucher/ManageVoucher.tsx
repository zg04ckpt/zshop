import React, { useState } from "react";
import '../../styles/pages/ManageVoucher.css';
import { Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Pagination from "../../components/Pagination";

const ManageVoucher = () => {
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(5);
    
    // Search state
    const [searchKey, setSearchKey] = useState<string>('');
    const [searchStartDate, setSearchStartDate] = useState<string>('');
    const [searchEndDate, setSearchEndDate] = useState<string>('');
    
    // Create form state
    const [voucherName, setVoucherName] = useState<string>('');
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [maxDiscount, setMaxDiscount] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [effectiveDate, setEffectiveDate] = useState<string>('');
    const [duration, setDuration] = useState<number>(0);

    // Mock data
    const mockVouchers = [
        {
            id: 1,
            code: 'SUMMER2024',
            name: 'Giảm giá mùa hè',
            discountLevel: '20%',
            maxDiscount: 100000,
            remainingQuantity: 45,
            totalQuantity: 100,
            effectiveDate: '2024-06-01',
            expiryDate: '2024-08-31'
        },
        {
            id: 2,
            code: 'FREESHIP50K',
            name: 'Miễn phí vận chuyển',
            discountLevel: '50000 VNĐ',
            maxDiscount: 50000,
            remainingQuantity: 120,
            totalQuantity: 200,
            effectiveDate: '2024-05-15',
            expiryDate: '2024-12-31'
        },
        {
            id: 3,
            code: 'NEWUSER100',
            name: 'Ưu đãi khách hàng mới',
            discountLevel: '15%',
            maxDiscount: 150000,
            remainingQuantity: 0,
            totalQuantity: 50,
            effectiveDate: '2024-01-01',
            expiryDate: '2024-06-30'
        }
    ];

    const columns: GridColDef[] = [
        { 
            field: 'stt', 
            headerName: 'STT', 
            width: 70,
            renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1 + (page - 1) * 10
        },
        { 
            field: 'code', 
            headerName: 'Mã', 
            width: 150,
            renderCell: (params) => (
                <div className="d-flex align-items-center">
                    <span className="me-2">{params.value}</span>
                    <i 
                        className='bx bx-copy pointer-hover' 
                        onClick={() => navigator.clipboard.writeText(params.value)}
                        title="Copy mã"
                    ></i>
                </div>
            )
        },
        { field: 'name', headerName: 'Tên', width: 200 },
        { field: 'discountLevel', headerName: 'Mức giảm', width: 130 },
        { 
            field: 'maxDiscount', 
            headerName: 'Giảm tối đa', 
            width: 130,
            renderCell: (params) => `${params.value.toLocaleString('vi-VN')} VNĐ`
        },
        { 
            field: 'quantity', 
            headerName: 'Số lượng', 
            width: 150,
            renderCell: (params) => `${params.row.remainingQuantity}/${params.row.totalQuantity}`
        },
        { 
            field: 'effectiveDate', 
            headerName: 'Có hiệu lực', 
            width: 130,
            renderCell: (params) => new Date(params.value).toLocaleDateString('vi-VN')
        },
        { 
            field: 'expiryDate', 
            headerName: 'Hết hạn', 
            width: 130,
            renderCell: (params) => new Date(params.value).toLocaleDateString('vi-VN')
        }
    ];

    const handleCreateVoucher = () => {
        // TODO: Implement create voucher logic
        console.log('Create voucher:', {
            voucherName,
            discountType,
            discountValue,
            maxDiscount,
            quantity,
            effectiveDate,
            duration
        });
        setShowCreateForm(false);
    };

    const handleSearch = () => {
        // TODO: Implement search logic
        console.log('Search:', { searchKey, searchStartDate, searchEndDate });
    };

    const handleResetSearch = () => {
        setSearchKey('');
        setSearchStartDate('');
        setSearchEndDate('');
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
                            <label className="form-label">Tên / Mã voucher</label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Nhập tên hoặc mã voucher"
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
                        onClick={() => setShowCreateForm(true)}
                    >
                        <i className='bx bx-plus'></i> Tạo mới voucher
                    </button>
                </div>

                {/* Voucher List */}
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={mockVouchers}
                        columns={columns}
                        hideFooter
                        disableRowSelectionOnClick
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

            {/* Create Voucher Form Modal */}
            {showCreateForm && (
                <div className="voucher-modal-overlay">
                    <div className="voucher-modal">
                        <div className="voucher-modal-header">
                            <h5>Tạo mới voucher</h5>
                            <button 
                                className="btn-close"
                                onClick={() => setShowCreateForm(false)}
                            ></button>
                        </div>
                        <div className="voucher-modal-body">
                            <div className="mb-3">
                                <label className="form-label">Tên voucher <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Nhập tên voucher"
                                    value={voucherName}
                                    onChange={(e) => setVoucherName(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Loại giảm giá <span className="text-danger">*</span></label>
                                <select 
                                    className="form-select"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                                >
                                    <option value="percent">Phần trăm (%)</option>
                                    <option value="amount">Số tiền cố định (VNĐ)</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Mức giảm <span className="text-danger">*</span>
                                    {discountType === 'percent' && <small className="text-muted"> (0-100)</small>}
                                    {discountType === 'amount' && <small className="text-muted"> (VNĐ)</small>}
                                </label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    placeholder={discountType === 'percent' ? 'Nhập % giảm' : 'Nhập số tiền giảm'}
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                    min={0}
                                    max={discountType === 'percent' ? 100 : undefined}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Giảm tối đa (VNĐ)</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    placeholder="Nhập số tiền giảm tối đa"
                                    value={maxDiscount}
                                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                                    min={0}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Số lượng <span className="text-danger">*</span></label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    placeholder="Nhập số lượng voucher"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    min={1}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Thời điểm có hiệu lực <span className="text-danger">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Khoảng thời gian có hiệu lực (ngày) <span className="text-danger">*</span></label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    placeholder="Nhập số ngày có hiệu lực"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    min={1}
                                />
                            </div>
                        </div>
                        <div className="voucher-modal-footer">
                            <button 
                                className="btn btn-secondary me-2"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-success"
                                onClick={handleCreateVoucher}
                            >
                                <i className='bx bx-check'></i> Tạo voucher
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageVoucher;
