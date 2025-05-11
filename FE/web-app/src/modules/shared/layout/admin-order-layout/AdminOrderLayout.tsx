import { Box, Tabs, Tab, createTheme, ThemeProvider } from "@mui/material";
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import React, { useEffect, useState } from "react";
import { TabContext } from "@mui/lab";
import './AdminOrderLayout.css';
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";

const AdminOrderLayout = () => {
    const outletContext = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="admin-order-layout">
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={location.pathname}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', height: '30px' }}>
                        <TabList onChange={(e, v) => navigate(v)}
                            sx={{
                                '& .MuiTab-root': {
                                minHeight: '30px',
                                padding: '4px 12px',
                                fontSize: '14px',
                                textTransform: 'none',
                                boxShadow: 'none',
                                color: 'grey', // Inactive tab text color
                                '&.Mui-selected': {
                                    color: 'black', // Active tab text color
                                    backgroundColor: '#f5f5f5', // Light grey background for the active tab (like in the image)
                                },
                                },
                                '& .MuiTabs-scroller': {
                                    height: '30px',
                                },
                                '& .MuiTabs-indicator': {
                                height: '2px',
                                backgroundColor: '#1976d2', // Ensure the indicator is blue (default MUI primary color)
                                },
                            }}
                        >
                            <Tab label="Đơn hàng" value="/admin/order" />
                            <Tab label="Yêu cầu hủy đơn" value="/admin/order/request-cancel" />
                        </TabList>
                    </Box>
                    <div className="p-2">
                        <Outlet context={outletContext}/>
                    </div>
                </TabContext>
            </Box>
        </div>
    );
}

export default AdminOrderLayout;