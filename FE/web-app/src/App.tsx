import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layout/main-layout/MainLayout';
import Home from './pages/home/Home';
import Test from './pages/Test';
import Detail from './pages/detail/Detail';
import Order from './pages/order/Order';
import Cart from './pages/cart/Cart';
import AccountLayout from './pages/account/AccountLayout';
import AccountInfo from './pages/account/account-info/AccountInfo';
import Address from './pages/account/address/Address';
import History from './pages/account/history/History';
import Register from './pages/register/Register';
import { ToastContainer } from 'react-toastify';
import LoginDialog from './components/login-dialog/LoginDialog.component';
import ConfirmEmail from './pages/confirm-email/ConfirmEmail';
import Search from './pages/Search/Search';

const router = createBrowserRouter([{ 
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
      { path: 'confirm-email', element: <ConfirmEmail/> },
      { path: 'cart', element: <Cart/> },
      { path: 'test', element: <Test/> },

    ] 
}]);

function App() {
  return (
    <>
      {/* Toast */}
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick
        rtl={false}
        // pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"/>
        
      <RouterProvider router={router}></RouterProvider>
      {/* <LoginDialog/> */}
    </>
  );
}

export default App;
