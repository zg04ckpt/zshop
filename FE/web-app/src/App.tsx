import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { About, AdminLayout, AppDispatch, ConfirmDialog, DynamicTitle, Footer, setupInterceptors, setUser, TopBar } from './modules/shared';
import { ConfirmEmail, getLocalUser, Login, Register } from './modules/auth';
import { CateManagement, CreateBook, Detail, Home, ListBook, Search, UpdateBook } from './modules/book';
import { Cart, Order } from './modules/payment';
import { AccountAddress, AccountPurchaseHistory, AccountInfo, AccountLayout, ListUser, ReviewBook } from './modules/user';
import { Overview } from './modules/analysis';
import PaymentHistory from './modules/user/pages/user-account/payment-history/PaymentHistory';
import OrderHistoryDetail from './modules/user/pages/user-account/order-history-detail/OrderHistoryDetail';
import MainLayout from './modules/shared/layout/main-layout/MainLayout';
import AdminOrderLayout from './modules/shared/layout/admin-order-layout/AdminOrderLayout';
import ListSystemOrder from './modules/payment/pages/management/list-system-order/ListSystemOrder';
import ListRequestCancelOrder from './modules/payment/pages/management/list-request-cancel-order/ListRequestCancelOrder';
import HandleGoogleLoginCallback from './modules/auth/pages/HandleGoogleLoginCallback';

export const router = createBrowserRouter([{ 
  path: '/',
  element: <App/>, 
  children: [
    { path: 'register', element: <Register/> },
    { path: 'login', element: <Login/> },
    { path: 'confirm-email', element: <ConfirmEmail/> },
    { path: 'google-login-callback', element: <HandleGoogleLoginCallback/> },
    { path: 'about', element: <About/> },

    { path: '', element: <MainLayout/>, children: [
      { index: true, element: <Home/> },
      { path: 'search', element: <Search/> },
      { path: 'book', element: <Detail/> },
      { path: 'order', element: <Order/> },
      { path: 'cart', element: <Cart/> }
    ] },

    { path: 'account', element: <AccountLayout/>, children: [
      { index: true, element: <AccountInfo/> },
      { path: 'address', element: <AccountAddress/> },
      { path: 'review-book', element: <ReviewBook/> },
      { path: 'purchase-history', element: <AccountPurchaseHistory/> },
      { path: 'payment-history', element: <PaymentHistory/> },
      { path: 'payment-history/detail', element: <OrderHistoryDetail/> },
    ]},
    
    { path: 'admin', element: <AdminLayout/>, children: [
      { path: 'product', index: true, element: <ListBook/> },
      { path: 'product/create', element: <CreateBook/> },
      { path: 'product/update', element: <UpdateBook/> },
      { path: 'user', element: <ListUser/> },
      { path: 'cate', element: <CateManagement/> },
      { path: 'order', element: <AdminOrderLayout/>, children: [
        { index: true, element: <ListSystemOrder/> },
        { path: 'request-cancel', element: <ListRequestCancelOrder/> },
      ] },
    ]},
  ] 
}]);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isApiReady, setIsApiReady] = useState<boolean>(false);
    
  useEffect(() => {
      dispatch(setUser(getLocalUser()));
  }, []);
  
  useEffect(() => {
      setupInterceptors(navigate, location, dispatch);
      setIsApiReady(true);
  }, []);

  return (
      <>
          {/* Content */}
          <TopBar/>
          <DynamicTitle/>
          <div style={{minHeight: '100vh'}}>
              <div className="col-12">
                  <Outlet context={{ isApiReady }}/>
              </div>
          </div>        
          <Footer/>
          <ScrollRestoration/>
          
          {/* Toast */}
          <Toaster />

          {/* Confirm dialog */}
          <ConfirmDialog/>
      </>
  );
}

export default App;
