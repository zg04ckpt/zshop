import React, { useEffect } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import MainLayout from './shared/layout/main-layout/MainLayout';
import AccountInfo from './shared/pages/account/account-info/AccountInfo';
import AccountLayout from './shared/pages/account/AccountLayout';
import Address from './shared/pages/account/address/Address';
import AdminLayout from './shared/pages/admin/AdminLayout';
import CateManagement from './shared/pages/admin/cate-management/CateManagement';
import Overview from './shared/pages/admin/overview/Overview';
import ProductManagement from './shared/pages/admin/product-management/ProductManagement';
import UserManagement from './shared/pages/admin/user-management/UserManagement';
import Cart from './shared/pages/cart/Cart';
import ConfirmEmail from './shared/pages/confirm-email/ConfirmEmail';
import Detail from './shared/pages/detail/Detail';
import Home from './shared/pages/home/Home';
import Login from './shared/pages/login/Login';
import Order from './shared/pages/order/Order';
import Register from './shared/pages/register/Register';
import Search from './shared/pages/search/Search';
import Test from './shared/pages/Test';
import History from "./shared/pages/account/history/History";
import { useDispatch } from 'react-redux';
import { AppDispatch } from './shared/stores/redux-toolkit.store';
import { updateUser } from './features/auth/auth.slice';
import ConfirmDialog from './shared/components/confirm-dialog/ConfirmDialog';

export const router = createBrowserRouter([{ 
  path: '/',
  element: <MainLayout/>, 
  children: [

    { index: true, element: <Home/> },
    { path: 'search', element: <Search/> },
    { path: 'detail', element: <Detail/> },
    { path: 'order', element: <Order/> },
    { path: 'cart', element: <Cart/> },
    { path: 'account', element: <AccountLayout/>, children: [
      { index: true, element: <AccountInfo/> },
      { path: 'address', element: <Address/> },
      { path: 'history', element: <History/> },
    ]},
    
    { path: 'register', element: <Register/> },
    { path: 'login', element: <Login/> },
    { path: 'confirm-email', element: <ConfirmEmail/> },

    { path: 'cart', element: <Cart/> },
    { path: 'admin', element: <AdminLayout/>, children: [
      { index: true, element: <Overview/> },
      { path: 'product', element: <ProductManagement/> },
      { path: 'user', element: <UserManagement/> },
      { path: 'cate', element: <CateManagement/> },
    ]},

    { path: 'test', element: <Test/> },

  ] 
}]);

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(updateUser());
  }, []);

  return (
    <>
      {/* Toast */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop limit={2} closeOnClick rtl={false} draggable pauseOnHover={false} theme="light"/>
      
      {/* Confirm dialog */}
      <ConfirmDialog/>

      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
