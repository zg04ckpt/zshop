import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ChangePass, ConfirmEmail, HandleGoogleLoginCallback, Login, Register } from './pages/auth';
import { About, Forbidden } from './pages/static';
import MainLayout from './layout/MainLayout';
import { CreateBook, Detail, Home, ManageBook, ManageCate, Search, UpdateBook } from './pages/book';
import { Cart, ManageCancelOrderRequest, ManageOrder, Order } from './pages/payment';
import { AccountLayout } from './layout/AccountLayout';
import { AccountAddress, AccountInfo, AccountPurchaseHistory, ManageUser, OrderHistoryDetail, PaymentHistory, ReviewBook } from './pages/user';
import AdminLayout from './layout/AdminLayout';
import AdminOrderLayout from './layout/AdminOrderLayout';
import { AppDispatch, setUser } from './stores';
import { getLoginInfo } from './api';
import { setupInterceptors } from './api/config/axios';
import TopBar from './layout/TopBar';
import { DynamicTitle } from './utils/DynamicTitle';
import { Footer } from './layout/Footer';
import ConfirmDialog from './components/ConfirmDialog';
import ManageVoucher from './pages/voucher/ManageVoucher';


export const router = createBrowserRouter([{ 
  path: '/',
  element: <App/>, 
  children: [
    { path: 'register', element: <Register/> },
    { path: 'login', element: <Login/> },
    { path: 'confirm-email', element: <ConfirmEmail/> },
    { path: 'change-pass', element: <ChangePass/> },
    { path: 'google-login-callback', element: <HandleGoogleLoginCallback/> },
    { path: 'about', element: <About/> },
    { path: 'forbidden', element: <Forbidden/> },

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
      { path: 'product', index: true, element: <ManageBook/> },
      { path: 'product/create', element: <CreateBook/> },
      { path: 'product/update', element: <UpdateBook/> },
      { path: 'user', element: <ManageUser/> },
      { path: 'cate', element: <ManageCate/> },
      { path: 'voucher', element: <ManageVoucher/> },
      { path: 'order', element: <AdminOrderLayout/>, children: [
        { index: true, element: <ManageOrder/> },
        { path: 'request-cancel', element: <ManageCancelOrderRequest/> },
      ] },
    ]},
  ] 
}]);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isApiReady, setIsApiReady] = useState<boolean>(false);

  const reinitUserSession = async () => {
    const res = await getLoginInfo();
    if (res.isSuccess) dispatch(setUser(res.data!));
  }
  
  useEffect(() => {
      setupInterceptors(navigate, location, dispatch);
      reinitUserSession();
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
