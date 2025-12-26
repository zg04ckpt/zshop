import React, { useState } from "react";
import '../../styles/pages/CreateVoucher.css';
import { useNavigate } from "react-router-dom";
import { DiscountType } from "../../types/voucher";
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from "../../stores";
import { useDispatch } from "react-redux";
import { createVoucher } from "../../api/voucher";
import { showErrorToast, showSuccessToast } from "../../utils";

const CreateVoucher = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [voucherName, setVoucherName] = useState<string>('');
    const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.Percentage);
    const [discountValue, setDiscountValue] = useState<string>('');
    const [maxDiscount, setMaxDiscount] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [effectiveDate, setEffectiveDate] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleCreateVoucher = async () => {

        // Validation
        if (!voucherName.trim()) {
            showErrorToast('Tên voucher không được để trống');
            return;
        }

        const discountNum = Number(discountValue);
        if (!discountValue || discountNum <= 0) {
            showErrorToast('Mức giảm phải lớn hơn 0');
            return;
        }

        if (discountType === DiscountType.Percentage && discountNum > 100) {
            showErrorToast('Mức giảm theo phần trăm không được vượt quá 100%');
            return;
        }

        if (discountType === DiscountType.Amount && discountValue != maxDiscount) {
            showErrorToast('Mức giảm theo lượng tiền không được khác số tiền tối đa');
            return;
        }

        const quantityNum = Number(quantity);
        if (!quantity || quantityNum <= 0) {
            showErrorToast('Số lượng phải lớn hơn 0');
            return;
        }

        if (!effectiveDate) {
            showErrorToast('Thời điểm có hiệu lực không được để trống');
            return;
        }

        const durationNum = Number(duration);
        if (!duration || durationNum <= 0) {
            showErrorToast('Khoảng thời gian phải lớn hơn 0');
            return;
        }

        const maxDiscountNum = Number(maxDiscount);
        if (maxDiscount && maxDiscountNum <= 0) {
            showErrorToast('Giảm tối đa phải lớn hơn 0');
            return;
        }

        setIsSubmitting(true);
        dispatch(startLoadingStatus());

        const hours = Number(duration);
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);

        const hoursToTimespan = (totalHours: number) => {
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;

            return `${days}.${String(hours).padStart(2, "0")}:00:00`;
        }

        const result = await createVoucher({
            name: voucherName,
            discountType,
            discount: Number(discountValue) || 0,
            maxDiscount: Number(maxDiscount) || 0,
            quantity: Number(quantity) || null,
            validFrom: effectiveDate,
            duration: hoursToTimespan(Number(duration))
        });

        if (result.isSuccess) {
            debugger
            showSuccessToast('Tạo voucher thành công');
            navigate('/admin/voucher');
        } else {
            showErrorToast(result.message || 'Yêu cầu thất bại');
        }
        setIsSubmitting(false);
        dispatch(endLoadingStatus());
    };

    const handleCancel = () => {
        navigate('/admin/voucher');
    };

    return (
        <div className="create-voucher">
            <div className="card card-body rounded-0">
                <div className="create-voucher-header mb-4">
                    <h5>
                        <i className='bx bx-gift'></i> Tạo mới voucher
                    </h5>
                    <p className="text-muted mb-0">Nhập thông tin để tạo voucher mới cho hệ thống</p>
                </div>

                <form className="create-voucher-form">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Tên voucher <span className="text-danger">*</span></label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Nhập tên voucher"
                                value={voucherName}
                                onChange={(e) => setVoucherName(e.target.value)}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Loại giảm giá <span className="text-danger">*</span></label>
                            <select 
                                className="form-select"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                            >
                                <option value={DiscountType.Percentage}>Phần trăm (%)</option>
                                <option value={DiscountType.Amount}>Số tiền cố định (VNĐ)</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Mức giảm <span className="text-danger">*</span>
                                {discountType === DiscountType.Percentage && <small className="text-muted"> (0-100)</small>}
                                {discountType === DiscountType.Amount && <small className="text-muted"> (VNĐ)</small>}
                            </label>
                            <input 
                                type="number" 
                                className="form-control"
                                placeholder={discountType === DiscountType.Percentage ? 'Nhập % giảm' : 'Nhập số tiền giảm'}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                min={0}
                                max={discountType === DiscountType.Percentage ? 100 : undefined}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Giảm tối đa (VNĐ)</label>
                            <input 
                                type="number" 
                                className="form-control"
                                placeholder="Nhập số tiền giảm tối đa"
                                value={maxDiscount}
                                onChange={(e) => setMaxDiscount(e.target.value)}
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Số lượng <span className="text-danger">*</span></label>
                            <input 
                                type="number" 
                                className="form-control"
                                placeholder="Nhập số lượng voucher"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min={1}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Thời điểm có hiệu lực <span className="text-danger">*</span></label>
                            <input 
                                type="datetime-local" 
                                className="form-control"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Khoảng thời gian có hiệu lực (giờ) <span className="text-danger">*</span></label>
                            <input 
                                type="number" 
                                className="form-control"
                                placeholder="Nhập số giờ có hiệu lực"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min={1}
                            />
                        </div>
                    </div>

                    <hr />

                    <div className="form-actions d-flex justify-content-end gap-2">
                        <button 
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <i className='bx bx-x'></i> Hủy
                        </button>
                        <button 
                            type="button"
                            className="btn btn-success"
                            onClick={handleCreateVoucher}
                            disabled={isSubmitting}
                        >
                            <i className='bx bx-check'></i> Tạo voucher
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateVoucher;
