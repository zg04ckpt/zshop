import { Breadcrumbs, Link, Typography } from "@mui/material";
import React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const Breadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
  
    const nameMap: { [key: string]: string } = {
        products: 'Products',
        search: 'Tìm kiếm sách',
        order: 'Đặt sách',
        cart: 'Giỏ hàng',
        book: 'Thông tin sách',
        account: 'Tài khoản',
        address: 'Địa chỉ đặt hàng',
        'payment-history': 'Lịch sử thanh toán',
        'detail': 'Chi tiết đơn hàng',
        'purchase-history': 'Sách đã mua'
    };
  
    return (
        <Breadcrumbs
            className="mb-3"
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ margin: '0 0' }}
        >
            {/* Home link */}
            <Link component={RouterLink} to="/" color="inherit" underline="hover">
                Trang chủ
            </Link>

            {/* Dynamic path segments */}
            {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const displayName =
                    nameMap[value] || value.charAt(0).toUpperCase() + value.slice(1); 
    
                return isLast ? (
                    <Typography key={to} color="text.primary">
                        {displayName}
                    </Typography>
                ):(
                    <Link
                        key={to}
                        component={RouterLink}
                        to={to}
                        color="inherit"
                        underline="hover"
                    >
                        {displayName}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
};

export default Breadcrumb;