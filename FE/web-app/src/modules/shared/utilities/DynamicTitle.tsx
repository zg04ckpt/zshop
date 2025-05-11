import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const DynamicTitle = () => {
    const location = useLocation();

    const titleMap: { [key: string]: string } = {
        '/': 'Trang chủ',
        '/about': 'Giới thiệu',
        '/change-pass': 'Đổi mật khẩu',
        '/forbidden': 'Lỗi truy cập',
        '/login': 'Đăng nhập',
        '/register': 'Đăng kí',
        '/search': 'Tìm sách',
        '/book': 'Thông tin sách',
        '/order': 'Đặt sách',
        '/cart': 'Giỏ hàng',
        '/admin': 'Quản lý',
        '/account': 'Quản lý tài khoản',
        '/account/address': 'Địa chỉ mua hàng',
        '/account/purchase-history': 'Lịch sử mua hàng',
        '/account/review-book': 'Đánh giá sách',
        '/account/payment-history': 'Lịch sử thanh toán',
        '/account/payment-history/detail': 'Chi tiết hóa đơn',
    };

    useEffect(() => {
        const pageTitle = titleMap[location.pathname] || 'ZShop';
        document.title = pageTitle;
    }, [location.pathname]); 

    return null;
};